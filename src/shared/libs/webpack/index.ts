import { webpack } from "webpack";
import webpackConfig from "../../../../webpack/webpack.dev";

export const compiler = webpack(webpackConfig);
