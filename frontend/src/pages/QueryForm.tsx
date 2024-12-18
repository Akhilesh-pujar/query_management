import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from '../hooks/useAuth';
import { useForm } from 'react-hook-form';

interface QueryFormData {
  queryNumber: string;
  title: string;
  subject: string;
  queryTo: string;
  priority: "Low" | "Medium" | "High";
  description: string;
  status: "pending" | "in-progress";
  email: string;
  attachment?: File | undefined;
}

interface QueryFormProps {
  onSubmit: (query: QueryFormData) => void;
}

function generateQueryNumber(): string {
  const prefix = 'QRY';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

export const QueryForm: React.FC<QueryFormProps> = ({ onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<QueryFormData>({
    defaultValues: {
      queryNumber: generateQueryNumber(),
      priority: "Low",
      status: "pending",
    },
  });

  useEffect(() => {
    const cachedEmail = localStorage.getItem("email");
    

    
    if (cachedEmail) {
      setValue("email", cachedEmail);
    } else {
      const email = "user@example.com"; // Replace with actual email logic
      localStorage.setItem("email", email);
      setValue("email", email);
    }
  }, [token, setValue]);

  const validateForm = (data: QueryFormData): string | null => {
    if (!data.title || data.title.length < 3) return "Title must be at least 3 characters long.";
    if (!data.subject || data.subject.length < 3) return "Subject must be at least 3 characters long.";
    if (!data.queryTo) return "Please select a department.";
    if (!data.description || data.description.length < 10) return "Description must be at least 10 characters long.";
    return null;
  };
  const onSubmitForm = async (data: QueryFormData) => {
    const validationError = validateForm(data);
    if (validationError) {
      setError(validationError);
      return;
    }
  
    setIsSubmitting(true);
    setError(null);
  
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === "attachment" && value instanceof FileList && value.length > 0) {
        formData.append(key, value[0]); // Handle file uploads
      } else {
        formData.append(key, value as string);
      }
    });
  
    try {
      const response = await fetch("http://127.0.0.1:8000/api/queries/create/", {
        method: "POST",
        body: formData, // Send FormData directly, no JSON.stringify
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to submit query");
      }
  
      const result = await response.json();
      onSubmit(result);
    } catch (error) {
      console.error("Error submitting query:", error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <Input
        {...register("title")}
        placeholder="Query Title"
      />
      {errors.title && <p className="text-red-500">Title is required</p>}

      <Input
        {...register("subject")}
        placeholder="Subject"
      />
      {errors.subject && <p className="text-red-500">Subject is required</p>}

      <Select
        onValueChange={(value) => setValue("queryTo", value)}
        value={watch("queryTo")}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ITSUPPORT">IT Support</SelectItem>
          <SelectItem value="IT_TEAM">IT</SelectItem>
          <SelectItem value="HARDWARE SUPPORT">Hardware Support</SelectItem>
        </SelectContent>
      </Select>
      {errors.queryTo && <p className="text-red-500">Please select a department</p>}

      <Select
        onValueChange={(value) => setValue("status", value as "pending" | "in-progress")}
        value={watch("status")}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in-progress">In Progress</SelectItem>
        </SelectContent>
      </Select>

      <Select
        onValueChange={(value) => setValue("priority", value as "Low" | "Medium" | "High")}
        value={watch("priority")}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Low">Low</SelectItem>
          <SelectItem value="Medium">Medium</SelectItem>
          <SelectItem value="High">High</SelectItem>
        </SelectContent>
      </Select>

      <Textarea
        {...register("description")}
        placeholder="Query Description"
      />
      {errors.description && <p className="text-red-500">Description is required</p>}

      <Input
        type="file"
        {...register("attachment")}
        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Query"}
      </Button>
    </form>
  );
};
