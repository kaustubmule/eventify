import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/events/:id",
    "/api/webhook/clerk",
    "/api/webhook/razorpay",
    "/api/uploadthing",
    "/api/orders/confirm"
  ],
  ignoredRoutes: [
    "/api/webhook/clerk",
    "/api/webhook/razorpay",
    "/api/uploadthing",
    "/api/orders/confirm"
  ],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
