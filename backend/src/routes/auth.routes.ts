router.get(
    "/me",
    authenticate,
    authController.me
);