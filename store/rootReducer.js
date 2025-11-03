import layout from "./layoutReducer";
import auth from "@/components/partials/auth/store";
import email from "@/components/partials/app/email/store";
import calendar from "@/components/partials/app/calender/store";
const rootReducer = {
  layout,
  auth,
  email,
  calendar,
};
export default rootReducer;
