import path from "path";
import webpack, { Configuration } from "webpack";
import nodeExternals from "webpack-node-externals";
import { resolveTsAliases } from "resolve-ts-aliases";

const config: Configuration = {
  entry: {
    app: path.resolve(__dirname, "..", "src", "server.ts"),
  },
  externals: [nodeExternals()],
  output: {
    path: path.resolve(__dirname, "..", "dist"),
    filename: "main.js",
    clean: true,
  },
  target: "node",
  mode: "none",
  module: {
    rules: [
      {
        test: /.ts$/,
        loader: "babel-loader",
        include: path.resolve(__dirname, "src/"),
        exclude: /node_modules/,
        options: {
          presets: [
            ["@babel/preset-env", { modules: "false" }],
            "@babel/preset-react",
          ],
          plugins: [
            [
              "@babel/plugin-proposal-object-rest-spread",
              { useBuiltIns: true },
            ],
            "@babel/plugin-proposal-class-properties",
          ],
        },
      },
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: resolveTsAliases(path.resolve("tsconfig.json")),
  },
  plugins: [
    new webpack.DefinePlugin({
      self: "global",
    }),
  ],
};

export default config;
