const express = require("express");
const router = express.Router();
const areaController = require("../controllers/area");
const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const areaValidations = require("../middleware/validations/request/area");

router.post(
    "/add",
    protect,
    authorizeRoles("admin"),
    areaValidations.validateBody,
    areaController.addArea
);

router.get(
    "/all",
    protect,
    authorizeRoles("admin", "customer"),
    areaController.fetchAllAreas
);

router.get(
    "/getOne",
    protect,
    authorizeRoles("admin", "customer"),
    areaValidations.validateQuery,
    areaController.fetchOneArea
);

router.put(
    "/update/:areaId",
    protect,
    authorizeRoles("admin"),
    areaValidations.validateParams,
    areaValidations.validateBody,
    areaController.updateArea
);

router.delete(
    "/delete/:areaId",
    protect,
    authorizeRoles("admin"),
    areaValidations.validateParams,
    areaController.deleteArea
);

module.exports = router;