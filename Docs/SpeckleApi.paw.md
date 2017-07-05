# POST /auth/register

+ Request (application/json; charset=utf-8)

        {
            "email": "johndoe@apple.com",
            "password": "luxurygoods"
        }

+ Response 200 (application/json; charset=utf-8)

    + Headers

            X-Powered-By: Express
            Access-Control-Allow-Origin: *
            Vary: Accept-Encoding
            Etag: W/"40-WY2wY5b2pvBOKwV7nEywmh3LCx0"

    + Body

            {"success":false,"message":"Email taken. Please login. Thanks!"}


# POST /auth/login

+ Request (application/json; charset=utf-8)

        {
            "email": "johndoe@apple.com",
            "password": "luxurygoods"
        }

+ Response 200 (application/json; charset=utf-8)

    + Headers

            X-Powered-By: Express
            Access-Control-Allow-Origin: *
            Vary: Accept-Encoding
            Etag: W/"30b-IA4hxeo71bmdrmCWH3TcWMNDSUQ"

    + Body

            {"success":true,"token":"JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTUyOGFkNDE3NDFkZDU0MmViYjZlZmMiLCJuYW1lIjoiVXNlciAxIiwiaWF0IjoxNDk5MTU2NTcyLCJleHAiOjE0OTkyNDI5NzJ9.Fhs9tUCZGNn-JBfCXxodKjVEByNoY0REDlhj0xpoV3c","user":{"name":"User 1","email":"johndoe@apple.com","logins":[{"date":1498581900633},{"date":1498582296092},{"date":1498582376669},{"date":1498582441756},{"date":1498640302951},{"date":1498641007934},{"date":1498641297299},{"date":1498658534006},{"date":1498658550795},{"date":1498832775815},{"date":1499016108166},{"date":1499156572287}],"apiToken":"JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTUyOGFkNDE3NDFkZDU0MmViYjZlZmMiLCJuYW1lIjoiQW5vbnltb3VzIiwiaWF0IjoxNDk4NTgxNzE2LCJleHAiOjE1NjE2OTY5MTZ9.Py9Fwbuj-eiWJDBqZVRv8-uWsTChakhbrLcgKoMS0a4"}}


# GET /api/profile

+ Request

    + Headers

            Authorization: JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTUyOGFkNDE3NDFkZDU0MmViYjZlZmMiLCJuYW1lIjoiVXNlciAxIiwiaWF0IjoxNDk5MTU2NTcyLCJleHAiOjE0OTkyNDI5NzJ9.Fhs9tUCZGNn-JBfCXxodKjVEByNoY0REDlhj0xpoV3c



+ Response 200 (application/json; charset=utf-8)

    + Headers

            X-Powered-By: Express
            Access-Control-Allow-Origin: *
            Vary: Accept-Encoding
            Etag: W/"284-0ShUWk6NOTZ5z288TTcqQUwHLVo"

    + Body

            {"_id":"59528ad41741dd542ebb6efc","updatedAt":"2017-07-02T17:21:48.178Z","createdAt":"2017-06-27T16:41:56.026Z","email":"johndoe@apple.com","name":"User 1","apitoken":"JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTUyOGFkNDE3NDFkZDU0MmViYjZlZmMiLCJuYW1lIjoiQW5vbnltb3VzIiwiaWF0IjoxNDk4NTgxNzE2LCJleHAiOjE1NjE2OTY5MTZ9.Py9Fwbuj-eiWJDBqZVRv8-uWsTChakhbrLcgKoMS0a4","__v":11,"logins":[{"date":1498581900633},{"date":1498582296092},{"date":1498582376669},{"date":1498582441756},{"date":1498640302951},{"date":1498641007934},{"date":1498641297299},{"date":1498658534006},{"date":1498658550795},{"date":1498832775815},{"date":1499016108166}]}


# POST /api/streams

+ Request

    + Headers

            Authorization: JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTUyOGFkNDE3NDFkZDU0MmViYjZlZmMiLCJuYW1lIjoiQW5vbnltb3VzIiwiaWF0IjoxNDk4NTgxNzE2LCJleHAiOjE1NjE2OTY5MTZ9.Py9Fwbuj-eiWJDBqZVRv8-uWsTChakhbrLcgKoMS0a4



+ Response 200 (application/json; charset=utf-8)

    + Headers

            X-Powered-By: Express
            Access-Control-Allow-Origin: *
            Vary: Accept-Encoding
            Etag: W/"155-yrM1bHaV2g5loKrW83+PR+sv+WI"

    + Body

            {"success":true,"message":"Created stream.","stream":{"__v":0,"updatedAt":"2017-07-02T16:03:48.121Z","createdAt":"2017-07-02T16:03:48.121Z","owner":"59528ad41741dd542ebb6efc","streamId":"B1nPYc84b","_id":"595919645fcf7b3055b22506","children":[],"parent":null,"layers":[],"objects":[],"name":"Speckle Stream","sharedWith":[],"private":false}}


# GET /api/streams

+ Request

    + Headers

            Authorization: JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTUyOGFkNDE3NDFkZDU0MmViYjZlZmMiLCJuYW1lIjoiVXNlciAxIiwiaWF0IjoxNDk5MTU2NTcyLCJleHAiOjE0OTkyNDI5NzJ9.Fhs9tUCZGNn-JBfCXxodKjVEByNoY0REDlhj0xpoV3c



+ Response 200 (application/json; charset=utf-8)

    + Headers

            X-Powered-By: Express
            Access-Control-Allow-Origin: *
            Vary: Accept-Encoding
            Etag: W/"291-minOCyscPYOl4vHO62WFt3DixcI"

    + Body

            {"success":true,"message":"Stream list for user 59528ad41741dd542ebb6efc","data":[{"_id":"59528f5d8ca2f755412d8256","updatedAt":"2017-06-27T17:01:17.938Z","createdAt":"2017-06-27T17:01:17.938Z","streamId":"SyLPkGgNW","name":"Super","sharedWith":[],"private":true},{"_id":"595373ba14fe9b69ed17881c","updatedAt":"2017-06-30T15:29:42.351Z","createdAt":"2017-06-28T09:15:38.171Z","streamId":"BJG6Qe-V-","name":"Wrong side of the moon","sharedWith":[],"private":false},{"_id":"59574e49df3da25abd72a6b1","updatedAt":"2017-07-01T07:24:57.041Z","createdAt":"2017-07-01T07:24:57.041Z","streamId":"Sk-8ApN4b","name":"Speckle Stream","sharedWith":[],"private":false}]}


# GET /api/streams/BJG6Qe-V-

+ Request

    + Headers

            Authorization: 



+ Response 200 (application/json; charset=utf-8)

    + Headers

            X-Powered-By: Express
            Access-Control-Allow-Origin: *
            Vary: Accept-Encoding
            Etag: W/"4fd-OW7Vt8ftaj2vqZLB0+eHm7+PRp0"

    + Body

            {"success":true,"stream":{"_id":"595373ba14fe9b69ed17881c","updatedAt":"2017-07-01T07:39:59.113Z","createdAt":"2017-06-28T09:15:38.171Z","owner":"59528ad41741dd542ebb6efc","streamId":"BJG6Qe-V-","__v":9,"children":[],"parent":null,"layers":[],"objects":[{"_id":"595751cfd00ccb5c09d9a784","__v":0,"properties":{"A":{"properties":{"A":{"value":[0,0,0],"type":"Point","hash":"Point.c6f057b86584942e415435ffb1fa93d4"},"B":{"origin":{"value":[0,0,0],"properties":null,"type":"Point","hash":"Point.c6f057b86584942e415435ffb1fa93d4"},"normal":{"value":[0,0,1],"properties":null,"type":"Vector","hash":"Vector.dc5c7986daef50c1e02ab09b442ee34f"},"xdir":{"value":[1,0,0],"properties":null,"type":"Vector","hash":"Vector.f899139df5e1059396431415e770c6dd"},"ydir":{"value":[0,1,0],"properties":null,"type":"Vector","hash":"Vector.ea20a043c08f5168d4409ff4144f32e2"},"properties":null,"type":"Plane","hash":"Plane.28d87a307987464d06ceee45f81ba19a"}},"type":"Polyline","hash":"Polyline.b8cabb148761a918b22128c8f05b1d47"}},"hash":"Mesh.2c3176b21893ac1cb0b69d83f49fa1f6","type":"Mesh"},{"_id":"595751cfd00ccb5c09d9a785","__v":0,"value":[0,0,0],"properties":null,"hash":"Vector.c6f057b86584942e415435ffb1fa93d4","type":"Vector"}],"name":"Wrong side of the moon","sharedWith":[],"private":false}}


# GET /api/streams/BJG6Qe-V-/meta

+ Request

    + Headers

            Authorization: JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTUyOGFkNDE3NDFkZDU0MmViYjZlZmMiLCJuYW1lIjoiQW5vbnltb3VzIiwiaWF0IjoxNDk4NTgxNzE2LCJleHAiOjE1NjE2OTY5MTZ9.Py9Fwbuj-eiWJDBqZVRv8-uWsTChakhbrLcgKoMS0a4



+ Response 200 (application/json; charset=utf-8)

    + Headers

            X-Powered-By: Express
            Access-Control-Allow-Origin: *
            Vary: Accept-Encoding
            Etag: W/"176-h35Oy7x+ML6TmcttVSg5Q/qd3EE"

    + Body

            {"success":true,"stream":{"_id":"595373ba14fe9b69ed17881c","updatedAt":"2017-07-01T07:39:59.113Z","createdAt":"2017-06-28T09:15:38.171Z","owner":"59528ad41741dd542ebb6efc","streamId":"BJG6Qe-V-","__v":9,"children":[],"parent":null,"layers":[],"objects":["595751cfd00ccb5c09d9a784","595751cfd00ccb5c09d9a785"],"name":"Wrong side of the moon","sharedWith":[],"private":false}}


# PUT /api/streams/BJG6Qe-V-

+ Request (application/json; charset=utf-8)

    + Headers

            Authorization: JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTUyOGFkNDE3NDFkZDU0MmViYjZlZmMiLCJuYW1lIjoiQW5vbnltb3VzIiwiaWF0IjoxNDk4NTgxNzE2LCJleHAiOjE1NjE2OTY5MTZ9.Py9Fwbuj-eiWJDBqZVRv8-uWsTChakhbrLcgKoMS0a4

    + Body

            {
                "objects": [
                    {
                        "properties": {
                            "A": {
                                "properties": {
                                    "A": {
                                        "value": [
                                            0,
                                            0,
                                            0
                                        ],
                                        "properties": {},
                                        "type": "Point",
                                        "hash": "Point.c6f057b86584942e415435ffb1fa93d4"
                                    },
                                    "B": {
                                        "origin": {
                                            "value": [
                                                0,
                                                0,
                                                0
                                            ],
                                            "properties": null,
                                            "type": "Point",
                                            "hash": "Point.c6f057b86584942e415435ffb1fa93d4"
                                        },
                                        "normal": {
                                            "value": [
                                                0,
                                                0,
                                                1
                                            ],
                                            "properties": null,
                                            "type": "Vector",
                                            "hash": "Vector.dc5c7986daef50c1e02ab09b442ee34f"
                                        },
                                        "xdir": {
                                            "value": [
                                                1,
                                                0,
                                                0
                                            ],
                                            "properties": null,
                                            "type": "Vector",
                                            "hash": "Vector.f899139df5e1059396431415e770c6dd"
                                        },
                                        "ydir": {
                                            "value": [
                                                0,
                                                1,
                                                0
                                            ],
                                            "properties": null,
                                            "type": "Vector",
                                            "hash": "Vector.ea20a043c08f5168d4409ff4144f32e2"
                                        },
                                        "properties": null,
                                        "type": "Plane",
                                        "hash": "Plane.28d87a307987464d06ceee45f81ba19a"
                                    }
                                },
                                "value": [
                                    -11,
                                    -9,
                                    0,
                                    -5,
                                    -5,
                                    0,
                                    -1,
                                    -14,
                                    0,
                                    7,
                                    -14,
                                    0,
                                    8,
                                    -12,
                                    0,
                                    4,
                                    -6,
                                    0
                                ],
                                "type": "Polyline",
                                "hash": "Polyline.b8cabb148761a918b22128c8f05b1d47"
                            }
                        },
                        "vertices": [
                            -1,
                            0,
                            -2,
                            0,
                            0,
                            -2,
                            1,
                            0,
                            -2,
                            -1,
                            0,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            -1,
                            0,
                            2,
                            0,
                            0,
                            2,
                            1,
                            0,
                            2
                        ],
                        "faces": [
                            1,
                            0,
                            1,
                            4,
                            3,
                            1,
                            1,
                            2,
                            5,
                            4,
                            1,
                            3,
                            4,
                            7,
                            6,
                            1,
                            4,
                            5,
                            8,
                            7
                        ],
                        "colors": [],
                        "type": "Mesh",
                        "hash": "Mesh.2c3176b21893ac1cb0b69d83f49fa1f6"
                    },
                    {
                        "value": [
                            0,
                            0,
                            0
                        ],
                        "properties": null,
                        "type": "Vector",
                        "hash": "Vector.c6f057b86584942e415435ffb1fa93d4"
                    }
                ],
                "name": "Wrong side of the moon",
                "layers": []
            }

+ Response 200 (application/json; charset=utf-8)

    + Headers

            X-Powered-By: Express
            Access-Control-Allow-Origin: *
            Vary: Accept-Encoding
            Etag: W/"47-gnfdmPXvW0aEM1mYe5dtNev2YR0"

    + Body

            {"success":true,"message":"Stream was updated.","streamId":"BJG6Qe-V-"}


# GET /api/streams/SyLPkGgNW

+ Request

    + Headers

            Authorization: JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTUyOGFkNDE3NDFkZDU0MmViYjZlZmMiLCJuYW1lIjoiVXNlciAxIiwiaWF0IjoxNDk5MTU2NTcyLCJleHAiOjE0OTkyNDI5NzJ9.Fhs9tUCZGNn-JBfCXxodKjVEByNoY0REDlhj0xpoV3c



+ Response 200 (application/json; charset=utf-8)

    + Headers

            X-Powered-By: Express
            Access-Control-Allow-Origin: *
            Vary: Accept-Encoding
            Etag: W/"3f5-sboVoBqCKM0nrHEf51NwkMMso10"

    + Body

            {"success":true,"stream":{"_id":"59528f5d8ca2f755412d8256","updatedAt":"2017-06-27T17:01:17.938Z","createdAt":"2017-06-27T17:01:17.938Z","owner":"59528ad41741dd542ebb6efc","streamId":"SyLPkGgNW","__v":0,"children":[],"parent":null,"layers":[],"objects":[{"_id":"5955ee7e8ea14a3a8b0349b0","properties":null,"hash":null,"type":"Null"},{"_id":"5956341732ef3b40584fe95c","properties":null,"hash":null,"type":"Null"},{"_id":"5956371499eaa441c9b5ec89","properties":null,"hash":null,"type":"Null"},{"_id":"5956371499eaa441c9b5ec8a","properties":null,"hash":null,"type":"Null"},{"_id":"59563745d2705141ea354ca7","properties":null,"hash":null,"type":"Null"},{"_id":"59563745d2705141ea354ca8","properties":null,"hash":null,"type":"Null"},{"_id":"595639e0d2705141ea354cab","properties":null,"hash":null,"type":"Null"},{"_id":"595639e0d2705141ea354cac","properties":null,"hash":null,"type":"Null"},{"_id":"595639e0d2705141ea354cad","properties":null,"hash":null,"type":"Null"}],"name":"Super","sharedWith":[],"private":true}}


# GET /api/streams/rkwnygWNb

+ Request

    + Headers

            Authorization: JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTUyOGFkNDE3NDFkZDU0MmViYjZlZmMiLCJuYW1lIjoiQW5vbnltb3VzIiwiaWF0IjoxNDk4NTgxNzE2LCJleHAiOjE1NjE2OTY5MTZ9.Py9Fwbuj-eiWJDBqZVRv8-uWsTChakhbrLcgKoMS0a4



+ Response 200 (application/json; charset=utf-8)

    + Headers

            X-Powered-By: Express
            Access-Control-Allow-Origin: *
            Vary: Accept-Encoding
            Etag: W/"152-LpeUGOtyzc3ggCnkwSb5KJwNLuc"

    + Body

            {"success":true,"stream":{"_id":"59536faf7131e7685cf4f4b0","updatedAt":"2017-06-28T08:58:23.180Z","createdAt":"2017-06-28T08:58:23.180Z","owner":"5952880dae39d153a067af0a","streamId":"rkwnygWNb","__v":0,"children":[],"parent":null,"layers":[],"objects":[],"name":"Speckle Stream","sharedWith":["59528ad41741dd542ebb6efc"],"private":true}}


# GET /api/streams/SyLPkGgNW

+ Request

    + Headers

            Authorization: 



+ Response 401 (application/json; charset=utf-8)

    + Headers

            X-Powered-By: Express
            Access-Control-Allow-Origin: *
            Vary: Accept-Encoding
            Etag: W/"3a-+JgxK///AC7a0sDgHpvwdbd+dvs"

    + Body

            {"success":false,"message":"Unauthorized. Please log in."}


# POST /api/objects

+ Request (application/json; charset=utf-8)

    + Headers

            Authorization: JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTUyOGFkNDE3NDFkZDU0MmViYjZlZmMiLCJuYW1lIjoiQW5vbnltb3VzIiwiaWF0IjoxNDk4NTgxNzE2LCJleHAiOjE1NjE2OTY5MTZ9.Py9Fwbuj-eiWJDBqZVRv8-uWsTChakhbrLcgKoMS0a4

    + Body

            {
                "objects": [
                    {
                        "value": [
                            0,
                            0,
                            0
                        ],
                        "properties": null,
                        "type": "Vector",
                        "hash": "Vector.c6f057b86584942e415435ffb1fa93d4"
                    },
                    {
                        "value": [
                            0,
                            0,
                            0
                        ],
                        "properties": null,
                        "type": "Point",
                        "hash": "Point.c6f057b86584942e415435ffb1fa93d4"
                    },
                    {
                        "properties": {
                            "A": {
                                "properties": {
                                    "A": {
                                        "value": [
                                            0,
                                            0,
                                            0
                                        ],
                                        "properties": {},
                                        "type": "Point",
                                        "hash": "Point.c6f057b86584942e415435ffb1fa93d4"
                                    },
                                    "B": {
                                        "origin": {
                                            "value": [
                                                0,
                                                0,
                                                0
                                            ],
                                            "properties": null,
                                            "type": "Point",
                                            "hash": "Point.c6f057b86584942e415435ffb1fa93d4"
                                        },
                                        "normal": {
                                            "value": [
                                                0,
                                                0,
                                                1
                                            ],
                                            "properties": null,
                                            "type": "Vector",
                                            "hash": "Vector.dc5c7986daef50c1e02ab09b442ee34f"
                                        },
                                        "xdir": {
                                            "value": [
                                                1,
                                                0,
                                                0
                                            ],
                                            "properties": null,
                                            "type": "Vector",
                                            "hash": "Vector.f899139df5e1059396431415e770c6dd"
                                        },
                                        "ydir": {
                                            "value": [
                                                0,
                                                1,
                                                0
                                            ],
                                            "properties": null,
                                            "type": "Vector",
                                            "hash": "Vector.ea20a043c08f5168d4409ff4144f32e2"
                                        },
                                        "properties": null,
                                        "type": "Plane",
                                        "hash": "Plane.28d87a307987464d06ceee45f81ba19a"
                                    }
                                },
                                "value": [
                                    -11,
                                    -9,
                                    0,
                                    -5,
                                    -5,
                                    0,
                                    -1,
                                    -14,
                                    0,
                                    7,
                                    -14,
                                    0,
                                    8,
                                    -12,
                                    0,
                                    4,
                                    -6,
                                    0
                                ],
                                "type": "Polyline",
                                "hash": "Polyline.b8cabb148761a918b22128c8f05b1d47"
                            }
                        },
                        "vertices": [
                            -1,
                            0,
                            -2,
                            0,
                            0,
                            -2,
                            1,
                            0,
                            -2,
                            -1,
                            0,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            -1,
                            0,
                            2,
                            0,
                            0,
                            2,
                            1,
                            0,
                            2
                        ],
                        "faces": [
                            1,
                            0,
                            1,
                            4,
                            3,
                            1,
                            1,
                            2,
                            5,
                            4,
                            1,
                            3,
                            4,
                            7,
                            6,
                            1,
                            4,
                            5,
                            8,
                            7
                        ],
                        "colors": [],
                        "type": "Mesh",
                        "hash": "Mesh.2c3176b21893ac1cb0b69d83f49fa1f6"
                    }
                ]
            }

+ Response 200 (application/json; charset=utf-8)

    + Headers

            X-Powered-By: Express
            Access-Control-Allow-Origin: *
            Vary: Accept-Encoding
            Etag: W/"d0-snGYN7Ik+MPEsXRSZpIXwaC9ddQ"

    + Body

            {"success":true,"objects":["59575428e3290e5c9c1b3122","59575428e3290e5c9c1b3123","59575428e3290e5c9c1b3124"],"geometries":["Mesh.2c3176b21893ac1cb0b69d83f49fa1f6","Polyline.b8cabb148761a918b22128c8f05b1d47"]}


# PUT /api/objects

+ Request (application/json; charset=utf-8)

    + Headers

            Authorization: JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1OTUyOGFkNDE3NDFkZDU0MmViYjZlZmMiLCJuYW1lIjoiQW5vbnltb3VzIiwiaWF0IjoxNDk4NTgxNzE2LCJleHAiOjE1NjE2OTY5MTZ9.Py9Fwbuj-eiWJDBqZVRv8-uWsTChakhbrLcgKoMS0a4

    + Body

            {
                "objects": [
                    {
                        "_id": "59566dc71877c74ea6d45cdc",
                        "__v": 0,
                        "vertices": [
                            -1,
                            0,
                            -2,
                            0,
                            0,
                            -2,
                            1,
                            0,
                            -2,
                            -1,
                            0,
                            0,
                            0,
                            0,
                            0,
                            1,
                            0,
                            0,
                            -1,
                            0,
                            2,
                            0,
                            0,
                            2,
                            1,
                            0,
                            2
                        ],
                        "faces": [
                            1,
                            0,
                            1,
                            4,
                            3,
                            1,
                            1,
                            2,
                            5,
                            4,
                            1,
                            3,
                            4,
                            7,
                            6,
                            1,
                            4,
                            5,
                            8,
                            7
                        ],
                        "colors": [],
                        "type": "Mesh",
                        "hash": "Mesh.2c3176b21893ac1cb0b69d83f49fa1f6"
                    },
                    {
                        "_id": "59575428e3290e5c9c1b3122",
                        "value": [
                            123,
                            3,
                            2
                        ],
                        "properties": {},
                        "hash": "Vector.c6f057b86584942e415435ffb1fa93d4",
                        "type": "Vector"
                    }
                ]
            }

+ Response 200 (application/json; charset=utf-8)

    + Headers

            X-Powered-By: Express
            Access-Control-Allow-Origin: *
            Vary: Accept-Encoding
            Etag: W/"32-JDEql44KadxtLT7jrY8sxluXurU"

    + Body

            {"success":true,"message":"Objects were updated."}


# GET /api/objects/59566dc71877c74ea6d45cdc

+ Request (application/octet-stream)



+ Response 200 (application/json; charset=utf-8)

    + Headers

            X-Powered-By: Express
            Access-Control-Allow-Origin: *
            Vary: Accept-Encoding
            Etag: W/"136-LdSjZf6sjgyyfD9krwcyAHymNl4"

    + Body

            {"success":true,"speckleObject":{"_id":"5955ed51cdebd536130bd07e","__v":0,"vertices":[-1,0,-2,0,0,-2,1,0,-2,-1,0,0,0,0,0,1,0,0,-1,0,2,0,0,2,1,0,2],"faces":[1,0,1,4,3,1,1,2,5,4,1,3,4,7,6,1,4,5,8,7],"colors":[],"type":"Mesh","hash":"Mesh.2c3176b21893ac1cb0b69d83f49fa1f6","properties":{"Borgstar":"BorgMaster"}}}


# GET /api/geometry/Polyline.b8cabb148761a918b22128c8f05b1d47

+ Request (application/octet-stream)



+ Response 200 (application/json; charset=utf-8)

    + Headers

            Vary: Accept-Encoding
            X-Powered-By: Express
            Access-Control-Allow-Origin: *
            Etag: W/"cb-NTC1diY9YKpQ9uCfNOwy6HQ7+ws"
            Cache-Control: public, max-age=31557600

    + Body

            {"success":true,"speckleObject":{"_id":"5955ed51cdebd536130bd07f","__v":0,"value":[-11,-9,0,-5,-5,0,-1,-14,0,7,-14,0,8,-12,0,4,-6,0],"type":"Polyline","hash":"Polyline.b8cabb148761a918b22128c8f05b1d47"}}


