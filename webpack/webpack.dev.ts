import webpack, { Configuration } from "webpack";
import merge from "webpack-merge";
import common from "./webpack.common";

const config: Configuration = merge(common, {
  mode: "development",
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devtool: "inline-source-map",
});

export default config;
