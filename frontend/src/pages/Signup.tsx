import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const signUpSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters'),
  last_name: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  contact_number: z.string().regex(/^\d{10}$/, 'Contact number must be 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  user_type: z.enum(['Internal', 'Customer']),
  otp: z.string().length(6, 'Email OTP must be 6 digits'),
});

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const [otpSent, setOtpSent] = useState(false);
  const [isSignUpEnabled, setSignUpEnabled] = useState(false);
  const navigate = useNavigate();
  const [session_id, setsession_id] = useState('');
  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      contact_number: '',
      password: '',
      user_type: 'Customer',
      otp: ' ',
    },
  });

  const sendOTP = async () => {
    const { first_name, last_name, email, contact_number, password,user_type } = form.getValues();

    // Validate form fields before sending OTP
    const isValid = await form.trigger(['first_name', 'last_name', 'email', 'contact_number', 'password','user_type']);
    if (!isValid) {
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/userdata-cache-withotp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name,
          last_name,
          email,
          contact_number,
          password,
          user_type,
        }),
      });
      

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to send OTP');
      }
      const result = await response.json();
      setOtpSent(true);
      setSignUpEnabled(true);
      setsession_id(result.session_id);
      alert('OTP sent successfully to your email');
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Failed to send OTP. Please try again.');
    }
  };

  const onSubmit = async (data: SignUpForm) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/userdata-verify-save/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id,
          otp:data.otp,
        
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to sign up');
      }

      const result = await response.json();
      console.log("Signup response:", result);
      alert('Sign up successful');
      navigate("/login");
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[600px]">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input {...field} type="tel" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="user_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select user type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Internal">Internal</SelectItem>
                        <SelectItem value="Customer">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="button" onClick={sendOTP} disabled={otpSent} className="w-full">
                {otpSent ? 'OTP Sent' : 'Send OTP'}
              </Button>
              {otpSent && (
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email OTP</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                      
                    )}
                  />
                </div>
              )}
              <Button type="submit" className="w-full" disabled={!isSignUpEnabled}>
                Sign Up
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center w-full">
            Already have an account? <a href="/login" className="text-blue-500 hover:underline">Log in</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}