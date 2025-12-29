const { where, json } = require("sequelize");
const ApiError = require("../utils/apiError");
const db = require("../models/db.model");
const jwt = require("jsonwebtoken");
const indiaData = require("../config/locationData");
const validateStateAndCity = require("../utils/validate/stateCityValidate");

const Users = db.users;
const loginlogs = db.loginlogs;

const UserService = () => {
  const createUser = async (req) => {
    const t = await db.sequelize.transaction();
    try {
      const { name, userName, mobileNo, password, userType } = req.body;
      if (!name || !userName || !mobileNo || !password || !userType) {
        throw new ApiError(400, "कृपया सभी फ़ील्ड भरें");
      }
      const existingUser = await Users.findOne({
        where: { userName },
      });
      if (existingUser) {
        throw new ApiError(400, "यह यूज़रनेम पहले से मौजूद है");
      }
      const existingMobile = await Users.findOne({
        where: { mobileNo, deletedAt: null },
      });
      if (existingMobile) {
        throw new ApiError(400, "यह मोबाइल नंबर पहले से मौजूद है");
      }
      const user = await Users.create(
        {
          name,
          userName,
          mobileNo,
          password,
          userType,
          generatedBy: req.user.id,
          // generatedBy: null,
          isPassword: true,
        },
        { transaction: t }
      );
      req.result = { user };
      await t.commit();
    } catch (error) {
      await t.rollback();
      throw error;
    }
  };
  const login = async (req) => {
    const { userName, password, fcmToken } = req.body;

    if (!userName || !password) {
      throw new ApiError(400, "यूज़रनेम और पासवर्ड आवश्यक हैं");
    }
    const user = await Users.findOne({ where: { userName } });

    if (!user) {
      throw new ApiError(400, "यूज़र नहीं मिला");
    }
    if (user.dataValues.password !== password) {
      throw new ApiError(400, "गलत पासवर्ड दर्ज किया गया है");
    }

    if (user.status === "Inactive") {
      throw new ApiError(
        400,
        "आपका अकाउंट निष्क्रिय है। कृपया निर्माता से संपर्क करें।"
      );
    }

  if (fcmToken && fcmToken.trim() !== "") {
    const [tokenRecord, created] = await db.userfcmtoken.findOrCreate({
      where: { fcmToken: fcmToken.trim(), userId: user.id },
      defaults: {
        deviceInfo: req.headers["user-agent"] || "Unknown Device",
        isActive: true,
      },
    });

    // अगर पहले से exists था और isActive false → true कर दो
    if (!created && tokenRecord.isActive === false) {
      await tokenRecord.update({ isActive: true });
    }
  }


    const payload = {
      id: user.id,
      name: user.name,
      userName: user.userName,
      mobileNo: user.mobileNo,
      userType: user.userType,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "365d",
    });
    await loginlogs.create({
      userId: user.id,
      token: token,
      fcmToken: fcmToken?.trim(),
      isExpired: false,
    });
    req.result = { user, token };
  };
  const changePassword = async (req) => {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword)
      throw new ApiError(400, "पुराना और नया पासवर्ड दोनों आवश्यक हैं");
    const userId = req.user.id;
    const user = await Users.findByPk(userId);
    if (!user) throw new ApiError(400, "उपयोगकर्ता नहीं मिला");
    if (user.password !== oldPassword)
      throw new ApiError(400, "पुराना पासवर्ड गलत है");
    user.password = newPassword;
    user.isPassword = false;
    await user.save();

    req.result = {
      user,
    };
  };
  const getProfile = async (req) => {
    const userId = req.user.id;

    const user = await Users.findByPk(userId, {
      attributes: [
        "id",
        "name",
        "mobileNo",
        "userName",
        "password",
        "userType",
        "wallet",
      ],
    });
    if (!user) throw new ApiError(400, "यूज़र नहीं मिला");

    let address = null;
    let bankDetails = null;

    if (user.userType === "Agent") {
      address = await db.address.findOne({ where: { userId } });
    }

    if (address) {
      const stateObj = indiaData.states.find(
        (s) => String(s.id) === String(address.state)
      );
      const stateName = stateObj ? stateObj.name : "Unknown State";

      address = {
        ...address.toJSON(),
        state: stateName,
      };
    }

    if (user.userType === "Agency" || user.userType === "Manufacturer") {
      bankDetails = await db.bankdetails.findOne({ where: { userId } });
    }

    const commission = await db.commissions.findOne({
      where: { agencyId: userId },
    });

    req.result = {
      user,
      bankDetails,
      address,
      commissionAmount: commission ? commission.commissionAmt : 0
    };
  };
  const createProfile = async (req) => {
    // const { addLine1, addLine2, state, city, pincode, accHolName, accountNo, bankname, ifsc, upi, qr } = req.body;
    // const userId = req.user.id;
    // const user = await Users.findByPk(userId);
    // let createdData = null;
    // if (user.userType === "Agent") {
    //   const exists = await db.address.findOne({ where: { userId } });
    //   if (exists) throw new Error("Address already exists");
    //   createdData = await db.address.create({
    //     userId: user.id,
    //     addLine1: addLine1,
    //     addLine2: addLine2,
    //     state: state,
    //     city: city,
    //     pincode: pincode
    //   })
    // }
    // if (user.userType === "Agency") {
    //   const exists = await db.bankdetails.findOne({ where: { userId } });
    //   if (exists) throw new Error("Bank details already exist");
    //   const checkAccNo = await db.bankdetails.findOne({ where: { accountNo } })
    //   if (checkAccNo) throw new ApiError(400, "account no must be unique");
    //   const checkUpiId = await db.bankdetails.findOne({ where: { upiId: upi } })
    //   if (checkUpiId) throw new ApiError(400, "upi id must be unique")
    //   createdData = await db.bankdetails.create({
    //     userId: user.id,
    //     bankName: bankname,
    //     accHolder: accHolName,
    //     accountNo: accountNo,
    //     ifscCode: ifsc,
    //     upiId: upi,
    //     QR: qr,
    //   })
    // }
    // req.result = { user, createdData }
  };
  const getAllStates = async (req) => {
    if (!indiaData.states || !Array.isArray(indiaData.states)) {
      throw new ApiError(
        "राज्य की जानकारी उपलब्ध नहीं है"
      );
    }
    req.result = {
      count: indiaData.states.length,
      state: indiaData.states,
    };
  };
  const getCitiesByState = async (req) => {
    const { stateId } = req.query;
    if (!stateId) throw new ApiError(400, "stateId जरूरी है");
    const cities = indiaData.city?.[stateId] || [];
    const stateName =
      indiaData.states.find((s) => s.id == stateId)?.name || "Unknown State";
    req.result = {
      stateId,
      stateName,
      count: cities.length,
      cities: cities.sort(),
    };
  };
  const profileUpdate = async (req) => {
    const {
      name,
      userName,
      mobileNo,
      addLine1,
      addLine2,
      state,
      city,
      pincode,
      bankname,
      accHolName,
      accountNo,
      upi,
      ifsc,
      qr,
    } = req.body;

    const userId = req.user.id;
    let updatedData = null;

    const user = await Users.findByPk(userId);
    if (!user) throw new ApiError(404, "उपयोगकर्ता नहीं मिला");

    // Username & Mobile uniqueness check (sabke liye)
    if (userName && userName !== user.userName) {
      const check = await Users.findOne({
        where: { userName, id: { [db.Op.ne]: userId } },
      });
      if (check) throw new ApiError(400, "यह यूज़रनेम पहले से लिया जा चुका है");
    }
    if (mobileNo && mobileNo !== user.mobileNo) {
      const check = await Users.findOne({
        where: { mobileNo, id: { [db.Op.ne]: userId } },
      });
      if (check) throw new ApiError(400, "यह मोबाइल नंबर पहले से रजिस्टर्ड है");
    }

    // State & City validation sirf Agent ke liye
    if (user.userType === "Agent" && state && city) {
      validateStateAndCity(state, city);
    }

    // === 1. Main User Fields Update (sabke liye) ===
    await user.update({
      name: name || user.name,
      userName: userName || user.userName,
      mobileNo: mobileNo || user.mobileNo,
    });

    // === 2. Agent → Address Update ===
    if (user.userType === "Agent") {
      let address = await db.address.findOne({ where: { userId } });

      const addressData = {
        userId,
        addLine1: addLine1?.trim() || null,
        addLine2: addLine2?.trim() || null,
        state: state || null,
        city: city || null,
        pincode: pincode || null,
      };

      if (!address) {
        address = await db.address.create(addressData);
      } else {
        await address.update(addressData);
      }

      const stateObj = indiaData.states.find(
        (s) => String(s.id) === String(state)
      );
      updatedData = {
        ...address.toJSON(),
        stateName: stateObj ? stateObj.name : null,
      };
    }

    // === 3.Agency → Full Bank Details ===
    else if (user.userType === "Agency") {
      let bankDetail = await db.bankdetails.findOne({ where: { userId } });

      const bankData = {
        userId,
        bankName: bankname?.trim() || null,
        accHolder: accHolName?.trim() || null,
        accountNo: accountNo?.trim() || null,
        ifscCode: ifsc?.trim() || null,
        upiId: upi?.trim() || null,
        QR: qr || null,
      };

      // Unique check sirf jab nayi value aaye
      if (accountNo && (!bankDetail || bankDetail.accountNo !== accountNo)) {
        const exists = await db.bankdetails.findOne({ where: { accountNo } });
        if (exists)
          throw new ApiError(
            400,
            "यह अकाउंट नंबर पहले से किसी अन्य एजेंसी का है"
          );
      }
      if (upi && (!bankDetail || bankDetail.upiId !== upi)) {
        const exists = await db.bankdetails.findOne({ where: { upiId: upi } });
        if (exists)
          throw new ApiError(400, "यह UPI ID पहले से किसी अन्य एजेंसी का है");
      }

      if (!bankDetail) {
        bankDetail = await db.bankdetails.create(bankData);
      } else {
        await bankDetail.update(bankData);
      }

      updatedData = bankDetail;
    }

    // === 4. Manufacturer → Sirf UPI ID + QR Code (same bankdetails table mein) ===
    else if (user.userType === "Manufacturer") {
      let bankDetail = await db.bankdetails.findOne({ where: { userId } });

      const manufacturerPaymentData = {
        userId,
        upiId: upi?.trim() || null,
        QR: qr || null,
        // Baaki fields null ya blank chhod do
        bankName: null,
        accHolder: null,
        accountNo: null,
        ifscCode: null,
      };

      // Agar pehli baar hai → create
      if (!bankDetail) {
        bankDetail = await db.bankdetails.create(manufacturerPaymentData);
      } else {
        // Sirf UPI aur QR update karo, baaki fields ko touch mat karo ya null kar do agar zarurat ho
        await bankDetail.update({
          upiId: upi?.trim() || bankDetail.upiId,
          QR: qr || bankDetail.QR,
          bankName: null,
          accHolder: null,
          accountNo: null,
          ifscCode: null,
        });
      }

      updatedData = {
        upiId: bankDetail.upiId,
        QR: bankDetail.QR ? true : false, // ya direct QR bhej do agar buffer hai
      };
    }

    // Final response tere style mein
    req.result = {
      user: {
        id: user.id,
        name: user.name,
        userName: user.userName,
        mobileNo: user.mobileNo,
        userType: user.userType,
      },
      updatedData,
    };
  };

  return {
    createUser,
    login,
    changePassword,
    getProfile,
    createProfile,
    getCitiesByState,
    getAllStates,
    profileUpdate,
  };
};
module.exports = UserService();
