# Icon Generator API Documentation

## Base URL

```
http://localhost:4000
```

**Production URL:** (Update when deployed)

---

## Authentication

No authentication required for this API.

---

## Endpoints

### 1. Generate Icons

Generate a set of 4 different icons based on a prompt, style, and optional color palette.

**Endpoint:** `POST /api/generate-icons`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "string (required)",
  "styleId": "string (required)",
  "colors": ["string"] (optional)
}
```

**Request Parameters:**

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `prompt` | string | Yes | The theme or subject for the icon set | `"coffee"`, `"music"`, `"travel"` |
| `styleId` | string | Yes | The visual style for the icons (see Style Options below) | `"pastel-flat"` |
| `colors` | string[] | No | Array of hex color codes (format: `#RRGGBB`) | `["#FF5733", "#33FF57"]` |

**Style Options:**

| styleId | Label | Description |
|---------|-------|-------------|
| `pastel-flat` | Style 1 – Soft Pastel Flat | Flat pastel icon style, soft pastel colors, smooth vector shapes |
| `glossy-bubble` | Style 2 – Glossy Bubble | Glossy 3D bubble icons, soft reflections and highlights |
| `minimal-line` | Style 3 – Minimal Line | Minimal monoline icon style, thin outlines, simple forms |
| `clay-3d` | Style 4 – 3D Clay | 3D clay icon style, soft clay texture, rounded forms |
| `playful-cartoon` | Style 5 – Playful Cartoon | Playful cartoon icon style, bold outlines, exaggerated shapes |

**Example Request:**
```json
{
  "prompt": "coffee",
  "styleId": "pastel-flat",
  "colors": ["#8B4513", "#D2691E", "#DEB887"]
}
```

**Success Response (200 OK):**
```json
{
  "images": [
    "https://replicate.delivery/pbxt/.../image1.png",
    "https://replicate.delivery/pbxt/.../image2.png",
    "https://replicate.delivery/pbxt/.../image3.png",
    "https://replicate.delivery/pbxt/.../image4.png"
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `images` | string[] | Array of 4 image URLs (URIs). Each URL points to a generated icon image. |

**Error Responses:**

#### 400 Bad Request - Validation Error
```json
{
  "error": "Prompt is required and must be a non-empty string",
  "statusCode": 400,
  "context": {
    "field": "prompt",
    "value": null
  }
}
```

**Common 400 Errors:**
- `"Prompt is required and must be a non-empty string"` - Missing or empty prompt
- `"styleId is required and must be a string"` - Missing or invalid styleId
- `"Invalid styleId"` - styleId doesn't match any available style
- `"colors must be an array"` - colors is not an array
- `"colors[0] must be a valid hex color (format: #RRGGBB)"` - Invalid hex color format

#### 404 Not Found
```json
{
  "error": "Icon style with identifier 'invalid-style' not found",
  "statusCode": 404,
  "context": {
    "resource": "Icon style",
    "identifier": "invalid-style"
  }
}
```

#### 500 Internal Server Error
```json
{
  "error": "Failed to generate icons",
  "statusCode": 500
}
```

#### 502 Bad Gateway
```json
{
  "error": "Replicate API request failed",
  "statusCode": 502,
  "context": {
    "status": 500,
    "originalError": "Internal server error from Replicate"
  }
}
```

---

### 2. Health Check

Check if the API server is running and healthy.

**Endpoint:** `GET /health`

**Request:** No parameters required

**Success Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Always `"ok"` when server is running |
| `timestamp` | string | Current server timestamp in ISO format |
| `uptime` | number | Server uptime in seconds |

---

## Color Format

Colors must be provided in hexadecimal format:
- Format: `#RRGGBB`
- Must start with `#`
- Must be exactly 6 hexadecimal characters (0-9, A-F)
- Case insensitive

**Valid Examples:**
- `#FF5733`
- `#33FF57`
- `#3357FF`
- `#000000` (black)
- `#FFFFFF` (white)

**Invalid Examples:**
- `FF5733` (missing #)
- `#FF5` (too short)
- `#GGGGGG` (invalid characters)
- `rgb(255, 87, 51)` (wrong format)

---

## Response Times

- Typical response time: 10-30 seconds (depends on Replicate API)
- Icons are generated in parallel for better performance
- Timeout: 60 seconds (handled by Replicate API)

---

## Rate Limits

Currently no rate limits are enforced. However, please be mindful of:
- Each request generates 4 icons (4 API calls to Replicate)
- Replicate API may have its own rate limits
- Consider implementing client-side rate limiting for production use

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Error message describing what went wrong",
  "statusCode": 400,
  "context": {
    // Optional additional context about the error
  }
}
```

**Error Status Codes:**

| Status Code | Meaning |
|------------|---------|
| 400 | Bad Request - Invalid input parameters |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server-side error |
| 502 | Bad Gateway - External API (Replicate) error |

---

## Example Usage

### JavaScript/TypeScript (Fetch API)

```typescript
async function generateIcons(prompt: string, styleId: string, colors?: string[]) {
  try {
    const response = await fetch('http://localhost:4000/api/generate-icons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        styleId,
        ...(colors && { colors }),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate icons');
    }

    const data = await response.json();
    return data.images; // Array of 4 image URLs
  } catch (error) {
    console.error('Error generating icons:', error);
    throw error;
  }
}

// Usage
const images = await generateIcons('coffee', 'pastel-flat', ['#8B4513', '#D2691E']);
console.log('Generated icons:', images);
```

### JavaScript/TypeScript (Axios)

```typescript
import axios from 'axios';

async function generateIcons(prompt: string, styleId: string, colors?: string[]) {
  try {
    const response = await axios.post('http://localhost:4000/api/generate-icons', {
      prompt,
      styleId,
      ...(colors && { colors }),
    });

    return response.data.images; // Array of 4 image URLs
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const errorData = error.response.data;
      throw new Error(errorData.error || 'Failed to generate icons');
    }
    throw error;
  }
}
```

### React Hook Example

```typescript
import { useState } from 'react';

interface GenerateIconsParams {
  prompt: string;
  styleId: string;
  colors?: string[];
}

function useIconGenerator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);

  const generateIcons = async (params: GenerateIconsParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:4000/api/generate-icons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate icons');
      }

      const data = await response.json();
      setImages(data.images);
      return data.images;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generateIcons, loading, error, images };
}
```

---

## Swagger Documentation

Interactive API documentation is available at:
- **Swagger UI:** `http://localhost:4000/api-docs`
- **OpenAPI JSON:** `http://localhost:4000/api-docs.json`

---

## Notes

1. **Image URLs:** The returned image URLs are temporary and hosted by Replicate. Consider downloading and storing them if you need permanent access.

2. **Image Format:** All images are generated as PNG files with 512x512 resolution (1:1 aspect ratio).

3. **Icon Variations:** Each of the 4 icons will be different but related to the prompt theme, maintaining visual consistency in style and color palette.

4. **CORS:** CORS is enabled for all origins. Update CORS settings for production.

5. **Environment:** This documentation is for the development environment. Production URLs and settings may differ.

---

## Support

For issues or questions, please contact the backend team or refer to the Swagger documentation at `/api-docs`.

