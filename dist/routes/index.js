"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MintRouter = exports.UserRouter = void 0;
const UserRoute_1 = __importDefault(require("./UserRoute"));
exports.UserRouter = UserRoute_1.default;
const MintRoute_1 = __importDefault(require("./MintRoute"));
exports.MintRouter = MintRoute_1.default;
