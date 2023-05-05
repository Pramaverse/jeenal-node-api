import { loginHandler, signupHandler } from "./handlers/auth";
import * as bodyParser from "body-parser";
import { authMiddleware } from "./jwt";
import {
  NextFunction,
  Response,
  Request,
  Application,
  RequestHandler,
  Router,
} from "express";
import {
  deleteUserByIdHandler,
  getAllUsersHandler,
  getCurrentUserHandler,
  getUserByIdHandler,
  updateUserByIdHandler,
} from "./handlers/user";
import { HttpError } from "./errors/error";
import {
  cheapProductsHandler,
  createProductHandler,
  deleteProductHandler,
  getAllProductsHandler,
  getProductHandler,
  updateProductHandler,
} from "./handlers/product";
import mongoose from "mongoose";
import {
  addProductToCart,
  deleteFromCartHandler,
  getProductsInCartHandler,
  updateCartHandler,
} from "./handlers/cart";
import {
  AddAddressToUserHandler,
  deleteAddressOfUserHandler,
  getAddressesOfUserHandler,
  updateAddressOfUserHandler,
} from "./handlers/address";
import {
  changeOrderStatusHandler,
  createOrderHandler,
  getAllOrdersHandler,
  getOrdersOfUserHandler,
} from "./handlers/order";

function asyncHandler(handler: RequestHandler): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

export function registerRoutes(app: Application) {
  app.use(bodyParser.json());
  app.post("/auth/signup", asyncHandler(signupHandler));
  app.post("/auth/login", asyncHandler(loginHandler));

  const userRouter = Router();
  userRouter.use(asyncHandler(authMiddleware));
  userRouter.get("/users/me", asyncHandler(getCurrentUserHandler));
  userRouter.get(
    "/5-cheapest-products",
    cheapProductsHandler,
    asyncHandler(getAllProductsHandler)
  );
  userRouter.get("/products", asyncHandler(getAllProductsHandler));
  userRouter.get("/products/:productId", asyncHandler(getProductHandler));
  userRouter.post("/cart/products/:productId", asyncHandler(addProductToCart));
  userRouter.get("/cart/products", asyncHandler(getProductsInCartHandler));
  userRouter.put("/cart/products/:productId", asyncHandler(updateCartHandler));
  userRouter.delete(
    "/cart/products/:productId",
    asyncHandler(deleteFromCartHandler)
  );
  userRouter.post("/users/me/address", asyncHandler(AddAddressToUserHandler));
  userRouter.get("/users/me/address", asyncHandler(getAddressesOfUserHandler));
  userRouter.delete(
    "/users/me/address/:addressId",
    asyncHandler(deleteAddressOfUserHandler)
  );
  userRouter.put(
    "/users/me/address/:addressId",
    asyncHandler(updateAddressOfUserHandler)
  );
  userRouter.post("/orders", asyncHandler(createOrderHandler));
  userRouter.get("/orders", asyncHandler(getOrdersOfUserHandler));
  userRouter.put("/orders/:orderId", asyncHandler(changeOrderStatusHandler));
  app.use("/", userRouter);

  const adminRouter = Router();

  adminRouter.use(asyncHandler(authMiddleware));
  adminRouter.use((req, res, next) => {
    if (req.user.role === "admin") {
      next();
    } else {
      next(new HttpError("Not Found", 404));
    }
  });
  adminRouter.get("/users", asyncHandler(getAllUsersHandler));
  adminRouter.get("/users/:userId", asyncHandler(getUserByIdHandler));
  adminRouter.put("/users/:userId", asyncHandler(updateUserByIdHandler));
  adminRouter.delete("/users/:userId", asyncHandler(deleteUserByIdHandler));
  adminRouter.post("/products", asyncHandler(createProductHandler));
  adminRouter.put("/products/:productId", asyncHandler(updateProductHandler));
  adminRouter.delete(
    "/products/:productId",
    asyncHandler(deleteProductHandler)
  );
  adminRouter.get("/orders", getAllOrdersHandler);
  app.use("/admin", adminRouter);

  app.use((req: Request, res: Response, next: NextFunction) => {
    next(new HttpError("Not Found", 404));
  });

  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof HttpError) {
      res.status(err.statusCode).json({ message: err.message });
      return;
    } else if (err instanceof mongoose.Error.ValidationError) {
      res.status(400).json({ message: err.message });
      return;
    } else if (err instanceof mongoose.Error.CastError) {
      res.status(400).json({ message: "invalid input" });
      return;
    }

    res.status(500).json({ message: "Internal Server Error" });
  });
}
