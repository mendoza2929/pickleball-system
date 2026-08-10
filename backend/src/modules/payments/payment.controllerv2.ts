// import { Request, Response } from "express";

// import { AuthRequest } from "../../middleware/authenticate";
// import { asyncHandler } from "../../shared/utils/asyncHandler";
// import { ApiResponse } from "../../utils/apiResponse";

// import { PaymentService } from "./payment.servicev2";
// import { createPaymentSchema } from "./payment.validator";

// export class PaymentController {
//   private paymentService: PaymentService;

//   constructor() {
//     this.paymentService = new PaymentService();
//   }

//   /**
//    * POST /api/payments
//    *
//    * Create GCash payment
//    *
//    * Guest reservations are allowed,
//    * so authentication is optional.
//    */
//   create = asyncHandler(
//     async (
//       req: AuthRequest,
//       res: Response
//     ) => {
//       // -----------------------------------------
//       // Validate request body
//       // -----------------------------------------

//       const data = createPaymentSchema.parse(
//         req.body
//       );

//       // -----------------------------------------
//       // Create PayMongo payment
//       // -----------------------------------------

//       const result =
//       await this.paymentService.create(
//         req.user?.id ?? null,
//         data
//       );

//       // -----------------------------------------
//       // Return payment information
//       // -----------------------------------------

//       return ApiResponse.success(
//         res,
//         result,
//         "Payment created successfully.",
//         201
//       );
//     }
//   );

//   /**
//    * GET /api/payments/uuid/:uuid
//    *
//    * Public payment lookup
//    */
//   getByUuid = asyncHandler(
//     async (
//       req: Request,
//       res: Response
//     ) => {
//       const uuid =
//         req.params.uuid as string;

//       const payment =
//         await this.paymentService.getByUuid(
//           uuid
//         );

//       return ApiResponse.success(
//         res,
//         payment,
//         "Payment retrieved successfully."
//       );
//     }
//   );

//   /**
//    * GET /api/payments/reservation/:reservationId
//    *
//    * Get payment for a reservation
//    */
//   getByReservation =
//     asyncHandler(
//       async (
//         req: AuthRequest,
//         res: Response
//       ) => {
//         // -----------------------------------------
//         // Authentication check
//         // -----------------------------------------

//         if (!req.user?.id) {
//           return res.status(401).json({
//             success: false,
//             message:
//               "Authentication required.",
//           });
//         }

//         // -----------------------------------------
//         // Get reservation ID from URL
//         // -----------------------------------------

//         const reservationId = Number(
//           req.params.reservationId
//         );

//         // -----------------------------------------
//         // Validate reservation ID
//         // -----------------------------------------

//         if (
//           !Number.isInteger(
//             reservationId
//           ) ||
//           reservationId <= 0
//         ) {
//           return res.status(400).json({
//             success: false,
//             message:
//               "Invalid reservation ID.",
//           });
//         }

//         // -----------------------------------------
//         // Get payment
//         // -----------------------------------------

//         const payment =
//           await this.paymentService.getByReservation(
//             reservationId
//           );

//         // -----------------------------------------
//         // Return payment
//         // -----------------------------------------

//         return ApiResponse.success(
//           res,
//           payment,
//           "Payment retrieved successfully."
//         );
//       }
//     );
// }