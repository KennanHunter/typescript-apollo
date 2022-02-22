import { extendType, nonNull, objectType, stringArg } from "nexus";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { APP_SECRET } from "../util/secrets";

export const AuthPayload = objectType({
	name: "AuthPayload",
	definition(t) {
		t.nonNull.string("token");
		t.nonNull.field("user", {
			type: "User",
		});
	},
});

export const AuthMutation = extendType({
	type: "Mutation",
	definition(t) {
		t.nonNull.field("signup", {
			type: "AuthPayload",
			args: {
				email: nonNull(stringArg()),
				password: nonNull(stringArg()),
				name: nonNull(stringArg()),
			},
			async resolve(parent, args, context) {
				const { email, name } = args;

				const password = await bcrypt.hash(args.password, 10);

				const user = await context.prisma.user.create({
					data: { email, name, password },
				});

				const token = jwt.sign({ userId: user.id }, APP_SECRET);

				return {
					token,
					user,
				};
			},
		});
		t.nonNull.field("login", {
			type: "AuthPayload",
			args: {
				email: nonNull(stringArg()),
				password: nonNull(stringArg()),
			},
			async resolve(parent, args, context) {
				const user = await context.prisma.user.findUnique({
					where: { email: args.email },
				});

				if (!user) {
					throw new Error("No Such User Found");
				}

				const valid = await bcrypt.compare(
					args.password,
					user.password
				);

				if (!valid) {
					throw new Error("Invalid Password");
				}

				const token = jwt.sign({ userId: user.id }, APP_SECRET);

				return {
					token,
					user,
				};
			},
		});
	},
});

export interface AuthTokenPayload {
	userId: number;
}

export function decodeAuthHeader(authHeader: string): AuthTokenPayload {
	const token = authHeader.replace("Bearer ", "");

	if (!token) {
		throw new Error("No error found");
	}
	return jwt.verify(token, APP_SECRET) as AuthTokenPayload;
}
