export const USER = [ // can be only one data
    {
        id: "clx1234567890abcdefghijklmn", // cuid id for better security, auto increment, auto generation,
        name: "G K Jaiswal", // name of the user, not required
        email: "admin@sbsgroups.co.in", // email of the user, required, save in encrypted way, 
        // bcrypt hash (cost factor 10) of the DUMMY password "SbsAdmin@2026" — meets the policy
        // described above (8-16 chars, upper+lower+digit+symbol, doesn't start/end weirdly).
        // 🔒 CHANGE THIS PASSWORD before going live, and generate a fresh hash with bcryptjs:
        //   node -e "console.log(require('bcryptjs').hashSync('YourNewPassword', 10))"
        password: "$2b$10$ZIYGX8Hk7OHucFN26R0lkOoExW6YESFIjYwd.xUgMN0sJv6gMldlm",
        image: "https://sbsgroups.co.in/assets/AmanSir2-DKf2uBi1.png", // profile photo of the image, not required, save refernce only and image will be save at cloudinary, and its refernce will be its url, 
        designation: "co-founder, admin", // designation of the admin in company by default it will be ADMIN
        createdAt: "10:15-15/06/2026",
        updatedAt: "10:15-15/06/2026",
    }
]
export const USERSETTINGS = [ // can only one data we can edit and update only can not delete and create
    {
        companyName: "SBS Groups", // company name
        companyHeaderLogoURL: "https://sbsgroups.co.in/assets/sbs_logo-C7_xX5GN.png", // company header logo can be 
        CompanyFooterLogo: "https://sbsgroups.co.in/assets/sbs_logo-C7_xX5GN.png", // compnay footer logo can be same or different
        companyFavIcon: "https://sbsgroups.co.in/assets/sbs_logo-C7_xX5GN.png", // place favicon to show
        CompanyOgTiltle: "SBS Groups we protect your people and project", // write og title
        CompanyOgImage: "https://sbsgroups.co.in/assets/sbs_logo-C7_xX5GN.png", // upload og image
        Keywords: "sbs groups, safety items, power plant machineries, ntpc supplier, adani supplier, reliance supplier, vedanta supplier, L&T supplier, NCL Supplier, powergrid supplier, lancho supplier, essar supplier, power mech supplier, aditya birla supplier, hindalcho mahan supplier, sasan ultra megha power project supplier, ozone, rita engineering, groz, snapon, diammond, ferreterro, trafitronics, pioneer, makita, kanex, vautid, udyogi, bajaj indef, crc, armor, gemini", // keywords
        aboutCompanyInShort: "SBS(Superb Bearing Store) Groups is a B2B dealer and providing and best quality of product to ensure safety and we also make sure that items will be eco-friendly.", // about company in short like in 200 words only, it will come from text editor
        companyMobile: "+91 9826808412, +91 8827559826", // can be one or more
        companyLocationGoogleMapLink: `<iframe src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d2066.0814256128074!2d82.62094258915218!3d24.070583890635593!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMjTCsDA0JzE2LjQiTiA4MsKwMzcnMjEuNiJF!5e0!3m2!1sen!2sin!4v1781498285662!5m2!1sen!2sin" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`, // google map link of company location to list on contact us page 
        copyRightReserveForFooter: "2026-27 all rights reserved", //to show in footer bottom, a copyright message
        createdAt: "10:15-15/06/2026",
        updatedAt: "10:15-15/06/2026",
    }
]