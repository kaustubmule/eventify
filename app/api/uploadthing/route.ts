import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Export routes for Next.js App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  // Configuration can be set here or via environment variables
  // The following options are available:
  // - uploadthingSecret: Your UploadThing secret key (deprecated, use UPLOADTHING_TOKEN)
  // - uploadthingId: Your UploadThing app ID (deprecated, use UPLOADTHING_TOKEN)
  // - token: Your UploadThing v7 token (combines secret and app ID)
  // - logLevel: 'Fatal' | 'Error' | 'Warning' | 'Info' | 'Debug' | 'Trace'
  config: {
    logLevel: 'Info',
  },
});
