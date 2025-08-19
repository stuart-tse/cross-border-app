'use client';

import { useState}  from "react";
import { Input } from "@/components/ui/Input";

interface Props {
    disabled?: boolean;
    fieldProps: any
}

export function PasswordField({ disabled, fieldProps }: Props) {
    const [showPassword, setShowPassword] = useState(false);

    return (
       <div className="space-y-2">
           <Input
               label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
               {...fieldProps}
               autoComplete="current-password"
                disabled={disabled}
               rightIcon={
               <button
                   type="button"
                   onClick={() => setShowPassword(!showPassword)}
                   className="p-1 text-gray-400 hover:text-gray-600 focus:outline-outline-none"
                     aria-label={showPassword ? "Hide password" : "Show password"}
                   >
                   { showPassword ? (
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                       </svg>
                   ) : (
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                       </svg>
                   )}
               </button>
               }
              />
       </div>
    );
}