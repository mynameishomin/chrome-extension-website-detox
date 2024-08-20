const path = require("path");

module.exports = {
    mode: "development",
    entry: {
        content_script: "./src/content_script.ts",
        popup: "./src/popup.ts",
        blocked: "./src/blocked.ts",
    },
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
    },
    resolve: {
        extensions: [".ts", ".js"],
    },
    devtool: "source-map",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
};
