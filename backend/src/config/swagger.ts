import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Icon Generator API",
    version: "1.0.0",
    description: "API for generating icon sets using Replicate's Flux Schnell model",
    contact: {
      name: "API Support",
    },
  },
  servers: [
    {
      url: `http://localhost:${process.env.PORT || 4000}`,
      description: "Development server",
    },
  ],
  tags: [
    {
      name: "Icons",
      description: "Icon generation endpoints",
    },
  ],
  paths: {
    "/api/generate-icons": {
      post: {
        tags: ["Icons"],
        summary: "Generate a set of 4 icons",
        description:
          "Generates a set of 4 different icons based on a prompt, style, and optional color palette",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["prompt", "styleId"],
                properties: {
                  prompt: {
                    type: "string",
                    description: "The theme or subject for the icon set",
                    example: "coffee",
                  },
                  styleId: {
                    type: "string",
                    enum: [
                      "pastel-flat",
                      "glossy-bubble",
                      "minimal-line",
                      "clay-3d",
                      "playful-cartoon",
                    ],
                    description: "The visual style for the icons",
                    example: "pastel-flat",
                  },
                  colors: {
                    type: "array",
                    items: {
                      type: "string",
                      pattern: "^#[0-9a-fA-F]{6}$",
                      example: "#FF5733",
                    },
                    description:
                      "Optional array of hex color codes to use in the icon palette",
                    example: ["#FF5733", "#33FF57", "#3357FF"],
                  },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Successfully generated icons",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    images: {
                      type: "array",
                      items: {
                        type: "string",
                        format: "uri",
                        description: "URL of the generated image",
                      },
                      description: "Array of 4 image URLs",
                      example: [
                        "https://replicate.delivery/pbxt/.../image1.png",
                        "https://replicate.delivery/pbxt/.../image2.png",
                        "https://replicate.delivery/pbxt/.../image3.png",
                        "https://replicate.delivery/pbxt/.../image4.png",
                      ],
                    },
                  },
                },
              },
            },
          },
          "400": {
            description: "Bad request - validation error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Prompt is required",
                    },
                  },
                },
              },
            },
          },
          "500": {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: {
                      type: "string",
                      example: "Failed to generate icons",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      IconStyle: {
        type: "object",
        properties: {
          id: {
            type: "string",
            enum: [
              "pastel-flat",
              "glossy-bubble",
              "minimal-line",
              "clay-3d",
              "playful-cartoon",
            ],
          },
          label: {
            type: "string",
          },
        },
      },
    },
  },
};

const options = {
  definition: swaggerDefinition,
  apis: ["./src/**/*.ts"], // Path to the API files
};

export const swaggerSpec = swaggerJsdoc(options);

