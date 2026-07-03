export const SUBSCRIBERS = [
    {
        id: "clx1234567890abcdefghijklmn",  //cuid for better security and url building
        name: "John Doe", // name of the subscriber, not required
        email: "john@gma.com", // email of the subscriber, required
        mobile: "+91 7974947528", // mobile of the subscriber, not required
        whatsapp: "+91 7974947528", // whatsapp of the subscriber, not required
        geolocation: {
            longtitude: "67.3545", // logtitude of subscriber, auto collect when subscribe
            Latitude: "89.0987", // latitude of subscriber, auto collect when subscribe
        },
        dateAndTime: "17:28-14/06/2026", // date and time of subscription formatt is to be hours:minutes-dd/mm/yyyy, auto sett when subscribe
        isSubscribed: "true", // can be true/false, when user from their notification mail clicks on unsubscribe it will auto false
        unsubscribeDate: "true", // it will be empty until public user clicks on unsubscribe and when he clicks on it. it will record date and time and make isubscribed false
    },
    {
        id: "clx1234567890abcdefghijklmn",
        name: "Emma Johnson",
        email: "emma@gma.com",
        mobile: "+91 8977889900",
        whatsapp: "+91 5678901234",
        geolocation: {
            longtitude: "77.6789",
            Latitude: "90.0987",
        },
        dateAndTime: "17:28-14/06/2026",
        isSubscribed: "true",
        unsubscribeDate: "true",
    },
    {
        id: "clx1234567890abcdefghijklmn",
        name: "Robert Downey",
        email: "robert@gma.com",
        mobile: "+91 9098979695",
        whatsapp: "+91 9596979899",
        geolocation: {
            longtitude: "77.6789",
            Latitude: "90.0987",
        },
        dateAndTime: "17:28-14/06/2026",
        isSubscribed: "true",
        unsubscribeDate: "true",
    },
]

export const NEWSLETTERSETTINGS = [
    {
        popup: "treu",
        popupActive: { //if true then it will ask these things
            nameActive: true, //if true then we can make it true or false
            mobileActive: "true", //if true then we can make it true or false
            whatsappActive: "true", //if true then we can make it true or false
            emailActive: "true", //if popup active true then it will be true can not be false
        },
        footer: "true",
        footerSection: { // if footer section active then only go ahead if false can go ahead
            nameActive: true, //if true then we can make it true or false
            mobileActive: "true", //if true then we can make it true or false
            whatsappActive: "true", //if true then we can make it true or false
            emailActive: "true", //if newsletter section footer active true then it will be true can not be false
        }
    }
]