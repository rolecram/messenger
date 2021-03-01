let services = [];
const xservices = [
{
    "name": "Restaurant",
    "icon": "resto-icon.gif",
    "place": "Floor 4",
    "state": 'Open',
    "capacity": {
        "estimate": 0,
        "now": 25,
        "total": 50
    },
    "contact": {
        id:'resto',
        name:'Vinicius',
        image:'vinicius.jpg',
        friendly:'Restaurant Manager'
    },

    "options": [
        {
        "name": "Reserve",
        "service": "reserve",
        "available":{
            "day":['12:00','12:30','13:00','13:30','14:00','14:30'],
            "night":['20:00','20:30','21:00','21:30','22:00','22:30']
            },
        "people":0,
        "time":1,
        "hour": 0,
        "reserved":false
        },
        {
        "name": "Chef Suggestion",
        "service": "chef-suggestion",
        "photos": ['plate-1.jpg','plate-2.jpg','plate-3.jpg','plate-4.jpg','plate-5.jpg','plate-6.jpg']
        },
        {
        "name": "Menu",
        "service": "menu"
        },
        {
        "name": "Photos",
        "service": "photos",
        "photos": [
                "resto-1.jpg",
                "resto-2.jpg",
                "resto-3.jpg"
            ]
    
        }
    ]
},
{
    "name": "Taxi",
    "icon": "taxi-icon.gif",
    "state": 'Available',
    "contact": {
        id:'taxi',
        name:'Toquinho',
        image:'toquinho.jpg',
        friendly:'Taxi Driver'
    },

    "options": [
        {
        "name": "Order Now",
        "service": "order"
        }
    ]
},
{
    "name": "Bar 360° View",
    "icon": "bar-icon.gif",
    "place": "Terrace",
    "state": 'Open',
    "capacity": {
        "estimate": 0,
        "now": 7,
        "total": 20
    },
    "contact": {
        id:'bar',
        name:'Roberto',
        image:'robertocarlos.jpg',
        friendly:'Bar Tender'
    },

    "options": [
        {
        "name": "Reserve",
        "service": "reserve",
        "available":{
            "day":['15:00','15:30','16:00','16:30','17:00','17:30'],
            "night":['22:00','23:30']
            },
        "people":0,
        "time":1,
        "hour": 0,
        "reserved":false

        },
        {
        "name": "Cocktails",
        "service": "photos",
        "photos": ['drink-1.jpg','drink-2.jpg','drink-3.jpg','drink-4.jpg','drink-5.jpg']
        },
        {
        "name": "Photos",
        "service": "photos",
        "photos": [
            "bar-1.jpg"
        ]
        }
    ]
},

{
    "name": "Beach",
    "icon": "beach-icon.gif",
    "state": 'Available',
    "capacity": {
        "estimate": 0,
        "now": 45,
        "total": 100
    },

    "contact": {
        id:'beach',
        name:'Sonia',
        image:'sonia.jpg',
        friendly:'Beach Lifeguard'
    },

    "options": [
        {
        "name": "Reserve",
        "service": "reserve",
        "available":{
            "day":['09:00','09:30','10:00','10:30','11:00','14:30'],
            },
        "people":0,
        "time":1,
        "hour": 0,
        "reserved":false

        },
        {
        "name":"Photos",
        "service":"photos",
        "photos": [
            "beach-1.jpg"
        ]
        }
    ]
}
,
{
    "name": "Room Service",
    "icon": "roomservice-icon.gif",
    "state": 'Available',
    "contact": {
        id:'roomservice',
        name:'María',
        image:'maria.jpg',
        friendly:'Room Service'
    },

    "options": [
        {
        "name": "Order Now",
        "service": "order"
        }
    ]
},
{
    "name": "Pool",
    "icon": "pool-icon.gif",
    "state": 'Open',
    "capacity": {
        "estimate": 0,
        "now": 15,
        "total": 20
    },
    "contact": {
        id:'pool',
        name:'Gilberto',
        image:'gilberto.jpg',
        friendly:'Coordinator'
    },

    "options": [
        {
        "name": "Reserve",
        "service": "reserve",
        "available":{
            "day":['09:00','09:30','15:00','17:30','19:00'],
            },
        "people":0,
        "time":1,
        "hour": 0,
        "reserved":false

        },
        {
        "name":"Photos",
        "service":"photos",
        "photos": [
            "pool-1.jpg","pool-2.jpg","pool-3.jpg"
        ]
        }
    ]
},
{
    "name": "Gym",
    "icon": "gym-icon.gif",
    "state": 'Full',
    "capacity": {
        "estimate": 0,
        "now": 4,
        "total": 4
    },
    "contact": {
        id:'gym',
        name:'Caetano',
        image:'caetano.jpg',
        friendly:'Instructor'
    },

    "options": [
        {
        "name": "Reserve",
        "service": "reserve",
        "available":{
            "day":['14:00','16:30'],
            "night":['20:00']
            },
        "people":0,
        "time":1,
        "hour": 0,
        "reserved":false

        },
        {
        "name":"Photos",
        "service":"photos",
        "photos": [
            "gym-1.jpg",
            "gym-2.jpg"
        ]
        }
    ]
}
,
{
    "name": "Spa",
    "icon": "spa-icon.gif",
    "state": 'Open',
    "capacity": {
        "estimate": 0,
        "now": 0,
        "total": 2
    },
    "contact": {
        id:'spa',
        name:'Gal',
        image:'gal.jpg',
        friendly:'Spa Therapist'
    },

    "options": [
        {
        "name": "Reserve",
        "service": "reserve",
        "available":{
            "day":['15:00','17:30'],
            "night":['20:00']
            },
        "people":0,
        "time":1,
        "hour": 0,
        "reserved":false

        },
        {
        "name":"Photos",
        "service":"photos",
        "photos": [
            "spa-1.jpg",
            "spa-2.jpg"
        ]
        }
    ]
}
,
{
    "name": "Rent a Car",
    "icon": "rentacar-icon.gif",
    "state": 'Open',
    "contact": {
        id:'rentacar',
        name:'Marisa',
        image:'marisa.jpg',
        friendly:'Manager'
    },

    "options": [
        {
        "name":"View Catalog",
        "service":"car-catalog"
        }
    ]
}
,
{
    "name": "Front Desk",
    "icon": "frontdesk-icon.gif",
    "state": 'Available',
    "contact": {
        id:'frontdesk',
        name:'Tom',
        image:'tom.jpg',
        friendly:'Manager'
    },

    "options": [
        {
            "name":"Check in",
            "service":"checkin"
        },
        {
            "name":"Check out",
            "service":"checkout"
        }
    
    ]
}


];
