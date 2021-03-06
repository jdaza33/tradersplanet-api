define({ "api": [
  {
    "type": "post",
    "url": "/discord/get-url/",
    "title": "Obtener el enlace de autorizacion a discord y redirigir",
    "name": "GetUrlAuth",
    "group": "Discord",
    "description": "<p>Servicio para redirigir al usuario a la plataforma de discord para que apruebe la autorizacion de Tplanet</p>",
    "version": "1.0.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Bearer {token}</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Number",
            "optional": false,
            "field": "id",
            "description": "<p>User's unique ID.</p>"
          }
        ]
      }
    },
    "filename": "controllers/discord.ctrl.js",
    "groupTitle": "Discord"
  },
  {
    "type": "post",
    "url": "/educations/list",
    "title": "Listar cursos",
    "name": "listEducations",
    "group": "Educations",
    "description": "<p>Servicio para listar los cursos, tambien lista las tarjetas del usuario en caso de que posea</p>",
    "version": "1.0.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": true,
            "field": "userId",
            "description": "<p>Cuando el usuario este logueado, se debe enviar su ID para verificar su cuenta</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "iso",
            "description": "<p>Lenguaje del usuario, por defecto = &quot;es&quot;</p>"
          }
        ]
      }
    },
    "filename": "controllers/education.ctrl.js",
    "groupTitle": "Educations"
  },
  {
    "type": "post",
    "url": "/payments/create/stripe",
    "title": "Realizar un pago con Stripe",
    "name": "payWithStripe",
    "group": "Payments",
    "description": "<p>Servicio para realizar un pago con la plataforma de stripe, guarda el cliente si es nuevo, guarda sus tarjetas y crear una suscripcion si aplica.</p>",
    "version": "1.0.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "authorization",
            "description": "<p>Bearer {token}</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "iso",
            "description": "<p>Lenguaje del usuario, por defecto = &quot;es&quot;</p>"
          }
        ]
      }
    },
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "allowedValues": [
              "\"education\"",
              "\"service\"",
              "\"subscription\""
            ],
            "optional": false,
            "field": "type",
            "description": "<p>Tipo del modelo que desea comprar o registrar</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "typeId",
            "description": "<p>ID del modelo</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "typePayment",
            "description": "<p>Ocurrencia del pago, solo aplica para suscripciones</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "userId",
            "description": "<p>ID del usuario que realiza el pago</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": false,
            "field": "isNew",
            "description": "<p>true si el usuario es nuevo y false si ya esta registrado en stripe (Para saber si esta registrado en stripe y tiene tarjetas, antes debe consultar /users/check-cards)</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "source",
            "description": "<p>En caso de que isNew sea falso, entonces se envia el source de la tarjeta</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "coupon",
            "description": "<p>Codigo de descuento, en caso de que el usuario lo tenga.</p>"
          },
          {
            "group": "Parameter",
            "type": "Boolean",
            "optional": true,
            "field": "saveCard",
            "description": "<p>Si desea guardar la tarjeta</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n type: \"education\",\n typeId: \"123456789\",\n typePayment: \"monthly\"\n userId: \"123456789\",\n isNew: true,\n coupon: 'FREEALL2021'\n source: 'source_123456789'\n saveCard: true\n}",
          "type": "json"
        }
      ]
    },
    "filename": "controllers/payment.ctrl.js",
    "groupTitle": "Payments"
  },
  {
    "type": "post",
    "url": "/services/list",
    "title": "Listar servicios",
    "name": "listServices",
    "group": "Services",
    "description": "<p>Servicio para listar los servicios, tambien lista las tarjetas del usuario en caso de que posea</p>",
    "version": "1.0.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": true,
            "field": "userId",
            "description": "<p>Cuando el usuario este logueado, se debe enviar su ID para verificar su cuenta</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "iso",
            "description": "<p>Lenguaje del usuario, por defecto = &quot;es&quot;</p>"
          }
        ]
      }
    },
    "filename": "controllers/service.ctrl.js",
    "groupTitle": "Services"
  },
  {
    "type": "post",
    "url": "/subscriptions/list",
    "title": "Listar suscripciones",
    "name": "listSubscriptions",
    "group": "Subscriptions",
    "description": "<p>Servicio para listar las suscripciones, tambien lista las tarjetas del usuario en caso de que posea</p>",
    "version": "1.0.0",
    "header": {
      "fields": {
        "Header": [
          {
            "group": "Header",
            "type": "String",
            "optional": true,
            "field": "userId",
            "description": "<p>Cuando el usuario este logueado, se debe enviar su ID para verificar su cuenta</p>"
          },
          {
            "group": "Header",
            "type": "String",
            "optional": false,
            "field": "iso",
            "description": "<p>Lenguaje del usuario, por defecto = &quot;es&quot;</p>"
          }
        ]
      }
    },
    "filename": "controllers/subscription.ctrl.js",
    "groupTitle": "Subscriptions"
  }
] });
