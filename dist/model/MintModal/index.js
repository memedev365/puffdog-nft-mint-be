"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MintModal = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mintSchema = new mongoose_1.default.Schema({
    hash: { type: String, require: true },
    wallet: { type: String, require: true },
    amount: { type: Number, require: true },
    count: { type: Number, require: true }
}, {
    timestamps: {
        createdAt: "created_at",
    },
});
exports.MintModal = mongoose_1.default.model("mint", mintSchema);
