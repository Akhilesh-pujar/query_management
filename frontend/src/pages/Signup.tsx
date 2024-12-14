import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const signUpSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  contactNumber: z.string().regex(/^\d{10}$/, 'Contact number must be 10 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  userType: z.enum(['internal', 'customer']),
  emailOTP: z.string().length(6, 'Email OTP must be 6 digits'),
  phoneOTP: z.string().length(6, 'Phone OTP must be 6 digits'),
});

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const [otpSent, setOtpSent] = useState(false);
  const [isSignUpEnabled, setSignUpEnabled] = useState(false);

  const form = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      contactNumber: '',
      password: '',
      userType: 'customer',
      emailOTP: '',
      phoneOTP: '',
    },
  });

  const sendOTP = async () => {
    const { firstName, lastName, email, contactNumber, password } = form.getValues();

    if (!firstName || !lastName || !email || !contactNumber || !password) {
      form.setError('firstName', { message: 'First name is required' });
      form.setError('lastName', { message: 'Last name is required' });
      form.setError('email', { message: 'Email is required' });
      form.setError('contactNumber', { message: 'Contact number is required' });
      form.setError('password', { message: 'Password is required' });
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/send-email-otp/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, contactNumber, password }),
      });
      

      if (!response.ok ) {
        throw new Error('');
      }

      const result = await response.json();
      
      if (result.success) {
        form.setValue('emailOTP', result.emailOTP); // Optionally prefill the OTP fields for testing
        form.setValue('phoneOTP', result.phoneOTP); // Optionally prefill the OTP fields for testing
        setOtpSent(true);
        setSignUpEnabled(true);
        alert('OTP sent successfully to your email and phone');
      } else {
        throw new Error(result.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to send OTP. Please try again.');
    }
  };

  const onSubmit = async (data: SignUpForm) => {
    try {
      const response = await fetch('http://127.0.0.1:8000/admin/api/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to sign up');
      }

      const result = await response.json();
      if (result.success) {
        alert('Sign up successful');
      } else {
        throw new Error(result.message || 'Failed to sign up');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
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
                  name="firstName"
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
                  name="lastName"
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
                name="contactNumber"
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
                name="userType"
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
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emailOTP"
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
                  <FormField
                    control={form.control}
                    name="phoneOTP"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone OTP</FormLabel>
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
