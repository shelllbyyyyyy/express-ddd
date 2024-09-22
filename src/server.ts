import { UserRoute } from "@/user/presentation/user.route";
import { AuthRoute } from "@/user/presentation/auth.route";
import { App } from "./main";

const app = new App([new UserRoute(), new AuthRoute()]);

app.listen();
