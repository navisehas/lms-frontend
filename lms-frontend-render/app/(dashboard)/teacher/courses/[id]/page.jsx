const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const pool = require("../config/db");
const { verifyToken, authorizeRoles } = require("../middleware/auth");

const router = express.Router();
const ALLOWED_TYPES = new Set(["PDF", "MEETING", "DOC", "VIDEO", "LINK", "OTHER"]);
const uploadDir = path.join(__dirname, "..", "public", "uploads", "materials");
let materialsSchemaReadyPromise = null;

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname || "") || "";
    cb(null, `${Date.now()}-${uuidv4()}${extension}`);
  },
});

const upload = multer({ storage });
const uploadAnyMaterial = upload.any();
const materialsJsonParser = express.json({ limit: "20mb" });
const materialsUrlEncodedParser = express.urlencoded({ extended: true, limit: "20mb" });

router.use((req, res, next) => {
  if (req.method === "GET" || req.method === "DELETE") {
    return next();
  }

  const contentType = String(req.headers["content-type"] || "").toLowerCase();

  if (contentType.includes("multipart/form-data")) {
    return next();
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return materialsUrlEncodedParser(req, res, (err) => {
      if (err) {
        req.body = {};
      }
      return next();
    });
  }

  return materialsJsonParser(req, res, (err) => {
    if (err) {
      req.body = {};
    }
    return next();
  });
});

function getUploadedFiles(req) {
  const files = [];
  
  if (req.files) {
    if (Array.isArray(req.files)) {
      files.push(...req.files);
    } else {
      // Handle different field names
      const fields = ['files', 'document', 'file', 'content', 'content_file', 'material', 'material_file'];
      for (const field of fields) {
        if (req.files[field] && Array.isArray(req.files[field])) {
          files.push(...req.files[field]);
        }
      }
    }
  }
  
  if (req.file) {
    files.push(req.file);
  }
  
  return files;
}

function pickBodyValue(body, keys) {
  for (const key of keys) {
    const value = body?.[key];
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
}

function getValueByPath(container, key) {
  if (!container || !key) {
    return undefined;
  }

  if (Object.prototype.hasOwnProperty.call(container, key)) {
    return container[key];
  }

  const normalizedPath = key.replace(/\[(\w+)\]/g, ".$1").split(".");
  let current = container;

  for (const part of normalizedPath) {
    if (current === null || current === undefined || typeof current !== "object" || !(part in current)) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}

function pickRequestValue(req, keys) {
  const sources = [req.body, req.query, req.params];

  for (const source of sources) {
    for (const key of keys) {
      const value = getValueByPath(source, key);
      if (value !== undefined && value !== null) {
        return value;
      }
    }
  }

  return undefined;
}

function toNullIfBlankOrNullish(value) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "object") {
    const objectValue =
      value.url ||
      value.link ||
      value.value ||
      value.id ||
      value.course_id ||
      value.courseId ||
      value.lesson_id ||
      value.lessonId ||
      null;

    if (objectValue !== null && objectValue !== undefined) {
      return toNullIfBlankOrNullish(objectValue);
    }
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return null;
  }

  const lower = normalized.toLowerCase();
  if (lower === "null" || lower === "undefined") {
    return null;
  }

  return normalized;
}

function extractIdValue(value) {
  if (value === undefined || value === null) {
    return null;
  }

  if (Array.isArray(value)) {
    return extractIdValue(value[0]);
  }

  if (typeof value === "object") {
    return toNullIfBlankOrNullish(
      value.course_id ||
      value.courseId ||
      value.lesson_id ||
      value.lessonId ||
      value.id ||
      value.value
    );
  }

  const normalized = String(value).trim();
  if (!normalized) {
    return null;
  }

  if ((normalized.startsWith("{") && normalized.endsWith("}")) || (normalized.startsWith("[") && normalized.endsWith("]"))) {
    try {
      const parsed = JSON.parse(normalized);
      return extractIdValue(parsed);
    } catch (_error) {
      return normalized;
    }
  }

  return normalized;
}

async function ensureMaterialsSchema() {
  if (!materialsSchemaReadyPromise) {
    materialsSchemaReadyPromise = (async () => {
      const client = await pool.connect();
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS lessons (
            lesson_id TEXT PRIMARY KEY,
            course_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            resource_url TEXT,
            lesson_order INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await client.query(`
          ALTER TABLE IF EXISTS lessons
          ADD COLUMN IF NOT EXISTS title TEXT
        `);

        await client.query(`
          DO $$
          BEGIN
            IF EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'lessons' AND column_name = 'lesson_title'
            ) THEN
              EXECUTE 'UPDATE lessons SET title = COALESCE(title, lesson_title) WHERE title IS NULL';
            END IF;

            IF EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'lessons' AND column_name = 'lesson_name'
            ) THEN
              EXECUTE 'UPDATE lessons SET title = COALESCE(title, lesson_name) WHERE title IS NULL';
            END IF;
          END $$
        `);

        await client.query(`
          ALTER TABLE IF EXISTS lessons
          ADD COLUMN IF NOT EXISTS lesson_order INTEGER NOT NULL DEFAULT 1
        `);

        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id)
        `);

        await client.query(`
          CREATE TABLE IF NOT EXISTS materials (
            material_id TEXT PRIMARY KEY,
            course_id TEXT NOT NULL,
            lesson_id TEXT,
            title TEXT NOT NULL,
            content_url TEXT,
            external_url TEXT,
            material_type TEXT NOT NULL DEFAULT 'DOC',
            subtopic TEXT,
            created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `);

        await client.query(`
          ALTER TABLE IF EXISTS lessons
          ADD COLUMN IF NOT EXISTS course_id TEXT
        `);

        await client.query(`
          ALTER TABLE IF EXISTS lessons
          ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        `);

        await client.query(`
          ALTER TABLE IF EXISTS materials
          ADD COLUMN IF NOT EXISTS material_id TEXT
        `);

        await client.query(`
          ALTER TABLE IF EXISTS materials
          ADD COLUMN IF NOT EXISTS course_id TEXT
        `);

        await client.query(`
          ALTER TABLE IF EXISTS materials
          ADD COLUMN IF NOT EXISTS title TEXT
        `);

        await client.query(`
          ALTER TABLE IF EXISTS materials
          ADD COLUMN IF NOT EXISTS lesson_id TEXT
        `);

        await client.query(`
          ALTER TABLE IF EXISTS materials
          ADD COLUMN IF NOT EXISTS content_url TEXT
        `);

        await client.query(`
          ALTER TABLE IF EXISTS materials
          ADD COLUMN IF NOT EXISTS material_type TEXT NOT NULL DEFAULT 'DOC'
        `);

        await client.query(`
          ALTER TABLE IF EXISTS materials
          ADD COLUMN IF NOT EXISTS external_url TEXT
        `);

        await client.query(`
          ALTER TABLE IF EXISTS materials
          ADD COLUMN IF NOT EXISTS subtopic TEXT
        `);

        await client.query(`
          ALTER TABLE IF EXISTS materials
          ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
        `);

        await client.query(`
          DO $$
          BEGIN
            IF EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'materials' AND column_name = 'material_title'
            ) THEN
              EXECUTE 'UPDATE materials SET title = COALESCE(title, material_title) WHERE title IS NULL';
            END IF;

            IF EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'materials' AND column_name = 'name'
            ) THEN
              EXECUTE 'UPDATE materials SET title = COALESCE(title, name) WHERE title IS NULL';
            END IF;
          END $$
        `);

        await client.query(`
          DO $$
          BEGIN
            IF EXISTS (
              SELECT 1
              FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'materials' AND column_name = 'resource_link'
            ) THEN
              EXECUTE 'ALTER TABLE materials ALTER COLUMN resource_link DROP NOT NULL';
              EXECUTE 'ALTER TABLE materials ALTER COLUMN resource_link SET DEFAULT ''''';
              EXECUTE 'UPDATE materials SET resource_link = '''' WHERE resource_link IS NULL';
            END IF;
          END $$
        `);

        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_materials_course_id ON materials(course_id)
        `);

        await client.query(`
          CREATE INDEX IF NOT EXISTS idx_materials_lesson_id ON materials(lesson_id)
        `);
      } finally {
        client.release();
      }
    })().catch((error) => {
      materialsSchemaReadyPromise = null;
      throw error;
    });
  }

  await materialsSchemaReadyPromise;
}

function getPublicUploadPath(file) {
  if (!file?.filename) return "";
  return `/uploads/materials/${file.filename}`;
}

function removeUploadedFile(publicPath) {
  if (!publicPath || !publicPath.startsWith("/uploads/materials/")) {
    return;
  }

  const absolutePath = path.join(__dirname, "..", "public", publicPath.replace(/^\//, ""));
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}

async function getCourseWithAccess(client, courseId, user) {
  const result = await client.query(
    `SELECT c.course_id, c.title, c.teacher_id
     FROM courses c
     WHERE c.course_id = $1`,
    [courseId]
  );

  if (result.rows.length === 0) {
    return { error: { status: 404, message: "Course not found." } };
  }

  const course = result.rows[0];

  if (user.role === "TEACHER" && course.teacher_id !== user.user_id) {
    return { error: { status: 403, message: "Access denied for this course." } };
  }

  return { course };
}

async function resolveSingleTeacherCourseId(client, user) {
  if (!user || user.role !== "TEACHER" || !user.user_id) {
    return null;
  }

  const result = await client.query(
    `SELECT course_id
     FROM courses
     WHERE teacher_id = $1
     ORDER BY course_id ASC
     LIMIT 2`,
    [user.user_id]
  );

  if (result.rows.length === 1) {
    return result.rows[0].course_id;
  }

  return null;
}

async function getLessonWithAccess(client, lessonId, user) {
  const result = await client.query(
    `SELECT
       l.lesson_id,
       l.course_id,
       l.title AS lesson_title,
       l.lesson_order,
       c.title AS course_title,
       c.teacher_id
     FROM lessons l
     JOIN courses c ON c.course_id = l.course_id
     WHERE l.lesson_id = $1`,
    [lessonId]
  );

  if (result.rows.length === 0) {
    return { error: { status: 404, message: "Lesson not found." } };
  }

  const lesson = result.rows[0];

  if (user.role === "TEACHER" && lesson.teacher_id !== user.user_id) {
    return { error: { status: 403, message: "Access denied for this lesson." } };
  }

  return { lesson };
}

async function getMaterialWithAccess(client, materialId, user) {
  const result = await client.query(
    `SELECT
       m.material_id,
       m.course_id,
       m.lesson_id,
       m.title,
       m.content_url,
       m.external_url,
       m.material_type,
       m.subtopic,
       l.title AS lesson_title,
       c.title AS course_title,
       c.teacher_id
     FROM materials m
     LEFT JOIN lessons l ON l.lesson_id = m.lesson_id
     JOIN courses c ON c.course_id = m.course_id
     WHERE m.material_id = $1`,
    [materialId]
  );

  if (result.rows.length === 0) {
    return { error: { status: 404, message: "Material not found." } };
  }

  const material = result.rows[0];

  if (user.role === "TEACHER" && material.teacher_id !== user.user_id) {
    return { error: { status: 403, message: "Access denied for this material." } };
  }

  return { material };
}

router.get("/teacher/:teacher_id/courses", verifyToken, authorizeRoles("TEACHER", "ADMIN"), async (req, res) => {
  const client = await pool.connect();
  try {
    await ensureMaterialsSchema();
    const { teacher_id } = req.params;

    if (req.user.role === "TEACHER" && req.user.user_id !== teacher_id) {
      return res.status(403).json({ error: "Access denied." });
    }

    const result = await client.query(
      `SELECT
         c.course_id,
         c.title,
         c.description,
         c.duration,
         c.thumbnail_url,
         COALESCE(mc.material_count, 0)::int AS material_count,
         COALESCE(lc.lesson_count, 0)::int AS lesson_count
       FROM courses c
       LEFT JOIN (
         SELECT course_id, COUNT(*) AS material_count
         FROM materials
         GROUP BY course_id
       ) mc ON mc.course_id = c.course_id
       LEFT JOIN (
         SELECT course_id, COUNT(*) AS lesson_count
         FROM lessons
         GROUP BY course_id
       ) lc ON lc.course_id = c.course_id
       WHERE c.teacher_id = $1
       ORDER BY c.title ASC`,
      [teacher_id]
    );

    res.json({ success: true, courses: result.rows });
  } catch (err) {
    console.error("GET /materials/teacher/:teacher_id/courses:", err.message);
    res.status(500).json({ error: "Failed to fetch teacher courses." });
  } finally {
    client.release();
  }
});

router.get("/lesson/:lesson_id", verifyToken, authorizeRoles("TEACHER", "ADMIN"), async (req, res) => {
  const client = await pool.connect();
  try {
    await ensureMaterialsSchema();
    const { lesson_id } = req.params;
    const { lesson, error } = await getLessonWithAccess(client, lesson_id, req.user);

    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    const materialsResult = await client.query(
      `SELECT
         material_id,
         course_id,
         lesson_id,
         title,
         content_url,
         external_url,
         material_type,
         subtopic,
         created_at
       FROM materials
       WHERE lesson_id = $1
       ORDER BY subtopic ASC NULLS LAST, created_at DESC`,
      [lesson_id]
    );

    res.json({
      success: true,
      lesson,
      materials: materialsResult.rows,
    });
  } catch (err) {
    console.error("GET /materials/lesson/:lesson_id:", err.message);
    res.status(500).json({ error: "Failed to fetch lesson materials." });
  } finally {
    client.release();
  }
});

router.get("/course/:course_id", verifyToken, authorizeRoles("TEACHER", "ADMIN"), async (req, res) => {
  const client = await pool.connect();
  try {
    await ensureMaterialsSchema();
    const { course_id } = req.params;
    const { course, error } = await getCourseWithAccess(client, course_id, req.user);

    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    const materialsResult = await client.query(
      `SELECT material_id, course_id, lesson_id, title, content_url, external_url, material_type, subtopic, created_at
       FROM materials
       WHERE course_id = $1
       ORDER BY subtopic ASC NULLS LAST, created_at DESC`,
      [course_id]
    );

    res.json({
      success: true,
      course,
      materials: materialsResult.rows,
    });
  } catch (err) {
    console.error("GET /materials/course/:course_id:", err.message);
    res.status(500).json({ error: "Failed to fetch materials." });
  } finally {
    client.release();
  }
});

router.post("/", verifyToken, authorizeRoles("TEACHER", "ADMIN"), uploadAnyMaterial, async (req, res) => {
  const client = await pool.connect();
  try {
    await ensureMaterialsSchema();

    const course_id = extractIdValue(
      pickRequestValue(req, [
        "course_id",
        "courseId",
        "course",
        "selectedCourseId",
        "selectedCourse",
        "course.id",
        "course.course_id",
        "course[course_id]",
        "course[value]",
        "courseId.value",
      ])
    );
    const lesson_id = extractIdValue(
      pickRequestValue(req, [
        "lesson_id",
        "lessonId",
        "lesson",
        "selectedLessonId",
        "selectedLesson",
        "lesson.id",
        "lesson.lesson_id",
        "lesson[lesson_id]",
        "lesson[value]",
        "lessonId.value",
      ])
    );
    const title = toNullIfBlankOrNullish(
      pickBodyValue(req.body, ["title", "material_title", "materialTitle", "name", "material_name", "materialName"])
    );
    const external_url = pickBodyValue(req.body, [
      "external_url",
      "externalUrl",
      "url",
      "link",
      "reference_url",
      "referenceUrl",
      "content_url",
      "contentUrl",
      "file_url",
      "fileUrl",
      "document_url",
      "documentUrl",
      "document",
      "content",
    ]);
    const material_type = pickBodyValue(req.body, ["material_type", "materialType", "type"]);
    const subtopic = toNullIfBlankOrNullish(
      pickBodyValue(req.body, ["subtopic", "sub_topic", "subTopic", "category", "topic"])
    );
    
    const uploadedFiles = getUploadedFiles(req);
    const normalizedExternalUrl = toNullIfBlankOrNullish(external_url);
    const normalizedTitle = title || (uploadedFiles[0]?.originalname) || `Material ${new Date().toISOString().slice(0, 19)}`;
    const normalizedSubTopic = subtopic || "General";

    const normalizedType = ALLOWED_TYPES.has(String(material_type || "").toUpperCase())
      ? String(material_type).toUpperCase()
      : "DOC";

    let resolvedCourseId = course_id;
    let resolvedLessonId = lesson_id || null;
    let course = null;
    let lessonTitle = null;
    let accessError = null;

    if (!resolvedCourseId && !resolvedLessonId) {
      resolvedCourseId = await resolveSingleTeacherCourseId(client, req.user);
    }

    if (!resolvedCourseId && !resolvedLessonId) {
      uploadedFiles.forEach(file => removeUploadedFile(getPublicUploadPath(file)));
      return res.status(400).json({
        error: "course_id is required. Please send course_id in the form data.",
      });
    }

    if (resolvedLessonId) {
      const lessonAccess = await getLessonWithAccess(client, resolvedLessonId, req.user);
      accessError = lessonAccess.error || null;

      if (!accessError) {
        resolvedCourseId = lessonAccess.lesson.course_id;
        course = {
          course_id: lessonAccess.lesson.course_id,
          title: lessonAccess.lesson.course_title,
        };
        lessonTitle = lessonAccess.lesson.lesson_title;
      }
    } else {
      const courseAccess = await getCourseWithAccess(client, resolvedCourseId, req.user);
      accessError = courseAccess.error || null;

      if (!accessError) {
        course = courseAccess.course;
      }
    }

    if (accessError) {
      uploadedFiles.forEach(file => removeUploadedFile(getPublicUploadPath(file)));
      return res.status(accessError.status).json({ error: accessError.message });
    }

    if (!resolvedCourseId) {
      uploadedFiles.forEach(file => removeUploadedFile(getPublicUploadPath(file)));
      return res.status(400).json({ error: "A valid course or lesson is required." });
    }

    // Create materials for each uploaded file
    const createdMaterials = [];
    
    // Handle file uploads
    for (const file of uploadedFiles) {
      const uploadedPath = getPublicUploadPath(file);
      const material_id = uuidv4();
      
      const result = await client.query(
        `INSERT INTO materials (material_id, course_id, lesson_id, title, content_url, external_url, material_type, subtopic, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
         RETURNING material_id, course_id, lesson_id, title, content_url, external_url, material_type, subtopic, created_at`,
        [material_id, resolvedCourseId, resolvedLessonId, file.originalname, uploadedPath, null, normalizedType, normalizedSubTopic]
      );
      createdMaterials.push({
        ...result.rows[0],
        course_title: course.title,
        lesson_title: lessonTitle,
      });
    }
    
    // Handle external URL if provided
    if (normalizedExternalUrl) {
      const material_id = uuidv4();
      const externalTitle = title || "External Link";
      
      const result = await client.query(
        `INSERT INTO materials (material_id, course_id, lesson_id, title, content_url, external_url, material_type, subtopic, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
         RETURNING material_id, course_id, lesson_id, title, content_url, external_url, material_type, subtopic, created_at`,
        [material_id, resolvedCourseId, resolvedLessonId, externalTitle, null, normalizedExternalUrl, normalizedType, normalizedSubTopic]
      );
      createdMaterials.push({
        ...result.rows[0],
        course_title: course.title,
        lesson_title: lessonTitle,
      });
    }

    if (createdMaterials.length === 0 && uploadedFiles.length === 0 && !normalizedExternalUrl) {
      return res.status(400).json({ error: "At least one file or external URL is required." });
    }

    res.status(201).json({
      success: true,
      materials: createdMaterials,
    });
  } catch (err) {
    const uploadedFiles = getUploadedFiles(req);
    uploadedFiles.forEach(file => removeUploadedFile(getPublicUploadPath(file)));
    console.error("POST /materials:", err.message);
    res.status(500).json({ error: "Failed to add material." });
  } finally {
    client.release();
  }
});

router.put("/:material_id", verifyToken, authorizeRoles("TEACHER", "ADMIN"), uploadAnyMaterial, async (req, res) => {
  const client = await pool.connect();
  try {
    await ensureMaterialsSchema();
    const { material_id } = req.params;
    const title = toNullIfBlankOrNullish(
      pickBodyValue(req.body, ["title", "material_title", "materialTitle", "name", "material_name", "materialName"])
    );
    const external_url = pickBodyValue(req.body, [
      "external_url",
      "externalUrl",
      "url",
      "link",
      "reference_url",
      "referenceUrl",
      "content_url",
      "contentUrl",
      "file_url",
      "fileUrl",
      "document_url",
      "documentUrl",
      "document",
      "content",
    ]);
    const material_type = pickBodyValue(req.body, ["material_type", "materialType", "type"]);
    const subtopic = toNullIfBlankOrNullish(
      pickBodyValue(req.body, ["subtopic", "sub_topic", "subTopic", "category", "topic"])
    );
    const uploadedFile = getUploadedFiles(req)[0];
    const uploadedPath = getPublicUploadPath(uploadedFile);
    const normalizedExternalUrl = toNullIfBlankOrNullish(external_url);

    if (!title) {
      if (uploadedPath) {
        removeUploadedFile(uploadedPath);
      }
      return res.status(400).json({ error: "Material title is required." });
    }

    const { material, error } = await getMaterialWithAccess(client, material_id, req.user);

    if (error) {
      if (uploadedPath) {
        removeUploadedFile(uploadedPath);
      }
      return res.status(error.status).json({ error: error.message });
    }

    const resolvedContentUrl = uploadedPath || material.content_url;
    const resolvedExternalUrl = normalizedExternalUrl || material.external_url;
    const resolvedSubtopic = subtopic || material.subtopic;

    if (!resolvedContentUrl && !resolvedExternalUrl) {
      if (uploadedPath) {
        removeUploadedFile(uploadedPath);
      }
      return res.status(400).json({ error: "Please upload a document or add a reference link." });
    }

    const normalizedType = ALLOWED_TYPES.has(String(material_type || "").toUpperCase())
      ? String(material_type).toUpperCase()
      : material.material_type;

    const result = await client.query(
      `UPDATE materials
       SET title = $1,
           content_url = $2,
           external_url = $3,
           material_type = $4,
           subtopic = $5
       WHERE material_id = $6
       RETURNING material_id, course_id, lesson_id, title, content_url, external_url, material_type, subtopic, created_at`,
      [title.trim(), resolvedContentUrl, resolvedExternalUrl, normalizedType, resolvedSubtopic, material_id]
    );

    if (uploadedPath && material.content_url && material.content_url !== uploadedPath) {
      removeUploadedFile(material.content_url);
    }

    res.json({
      success: true,
      material: {
        ...result.rows[0],
        course_title: material.course_title,
        lesson_title: material.lesson_title,
      },
    });
  } catch (err) {
    const uploadedFile = getUploadedFiles(req)[0];
    const uploadedPath = getPublicUploadPath(uploadedFile);
    if (uploadedPath) {
      removeUploadedFile(uploadedPath);
    }
    console.error("PUT /materials/:material_id:", err.message);
    res.status(500).json({ error: "Failed to update material." });
  } finally {
    client.release();
  }
});

router.delete("/:material_id", verifyToken, authorizeRoles("TEACHER", "ADMIN"), async (req, res) => {
  const client = await pool.connect();
  try {
    await ensureMaterialsSchema();
    const { material_id } = req.params;
    const { material, error } = await getMaterialWithAccess(client, material_id, req.user);

    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    await client.query("DELETE FROM materials WHERE material_id = $1", [material_id]);
    if (material.content_url) {
      removeUploadedFile(material.content_url);
    }
    res.json({ success: true, message: "Material removed." });
  } catch (err) {
    console.error("DELETE /materials/:material_id:", err.message);
    res.status(500).json({ error: "Failed to remove material." });
  } finally {
    client.release();
  }
});

module.exports = router;
