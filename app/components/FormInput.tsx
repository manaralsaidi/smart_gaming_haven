"use client";
import { FormField, FormItem, FormControl, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React from "react";
import { useFormContext } from "react-hook-form";

const FormInput = ({ name, label, type }: { name: string; label: string; type: string }) => {
  const form = useFormContext();
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {label && <FormLabel className=" text-gray-50 text-base">{label}</FormLabel>}
          <FormControl>
            <Input
              className=" text-base text-white"
              type={type || "text"}
              placeholder={label || "Enter ..."}
              {...field}
            />
          </FormControl>
          <FormMessage className=" text-red-500 text-sm  font-semibold" />
        </FormItem>
      )}
    />
  );
};

export default FormInput;
