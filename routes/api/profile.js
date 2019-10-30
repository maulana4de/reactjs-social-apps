const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");

const ProfileModel = require("../../models/Profile");
const UserModel = require("../../models/User");

// @route     GET api/profile/me
// @desc      Get current user profile
// @access    Private
router.get("/", auth, async (req, res) => {
  try {
    const profile = await ProfileModel.findOne({ user: req.user.id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
