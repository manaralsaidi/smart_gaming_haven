"use client";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import FormInput from "../FormInput";
import MotionItem from "../defaults/MotionItem";
import MaxWidthWrapper from "../defaults/MaxWidthWrapper";
import Logo from "../defaults/Logo";
import Link from "next/link";
import { FileUploadDemo } from "../FileUpload";
import { signup } from "@/app/actions/auth";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// 1. تحديد شروط التحقق من البيانات (Validation Schema)
const singupSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email" }),
    password: z.string().min(5, { message: "Password must be at least 5 characters" }),
    name: z.string().min(5, { message: "Name must be at least 5 characters" }),
    avatar: z.any().optional(),
    confirmPassword: z.string().min(5, { message: "Password must be at least 5 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const Singup = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof singupSchema>>({
    resolver: zodResolver(singupSchema),
    defaultValues: {
      password: "",
      email: "",
      name: "",
      avatar: "",
      confirmPassword: "",
    },
  });

  const [isPending, startTransition] = useTransition();

  // 2. دالة إرسال البيانات عند الضغط على Submit
  const onSubmit = async (data: z.infer<typeof singupSchema>) => {
    startTransition(async () => {
      
      // تحويل الصورة إلى نص Base64 محلياً (بدون أي خدمة سحابية خارجية)
      if (data.avatar && data.avatar.length > 0) {
        try {
          const file = data.avatar[0];
          const base64String = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Failed to read image file"));
            reader.readAsDataURL(file);
          });

          data.avatar = base64String; // 🖼️ يخزن كنص Base64 مباشرة بحقل avatar بقاعدة البيانات
        } catch (error) {
          console.error("Photo processing failed:", error);
          toast.error("حدث خطأ أثناء معالجة الصورة، سيتم محاولة التسجيل بدونها.");
          data.avatar = null;
        }
      } else {
        data.avatar = null;
      }

      // إرسال البيانات النهائية إلى قاعدة البيانات (منفصلة تماماً لضمان عملها)
      try {
        const response = await signup(data);
        console.log("Signup Response:", response);
        
        if (response?.success) {
          toast.success(response.success);
          router.push('/');
          router.refresh();
        } else {
          toast.error(response?.error || "حدث خطأ غير متوقع");
        }
      } catch (signupError) {
        console.error("Signup Action Error:", signupError);
        toast.error("فشل الاتصال بالسيرفر أثناء التسجيل");
      }
    });
  };

  return (
    <MotionItem animate={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 30 }}>
      <MaxWidthWrapper
        customPadding={" py-14"}
        className="flex flex-col gap-4 items-center w-full bg-black/60 rounded-2xl border border-input"
      >
        <Logo />
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full flex-col gap-6">
            <FileUploadDemo name="avatar" />
            <FormInput name="name" label="Name" type="text" />
            <FormInput name="email" label="Email" type="text" />
            <FormInput name="password" label="Password" type="password" />{" "}
            <FormInput name="confirmPassword" type="password" label="Confirm Password" />
            <Button disabled={isPending} type="submit">
              Submit
            </Button>
          </form>
        </Form>
        <div className="capitalize text-base font-semibold flex items-center gap-2">
          <p className="text-gray-50">Already Have An Account ?!</p>{" "}
          <Link className="text-rose-500 hover:underline" href={"/login"}>
            Login In to Your Account
          </Link>
        </div>
      </MaxWidthWrapper>
    </MotionItem>
  );
};

export default Singup;