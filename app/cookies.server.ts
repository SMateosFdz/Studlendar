import { createCookie } from "@remix-run/node";
export const userId = createCookie("userId", {
  maxAge: 604_800, // one week
  path: "/",
  httpOnly: true,
  secure: true,
});
