const express = require('express');
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { tenantGuard } = require('../middleware/tenantGuard');
const { memberOrAdmin } = require('../middleware/rbac');
const { createTaskRules, updateTaskRules, mongoIdParam, listTaskRules } = require('../middleware/validators/taskValidators');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect, tenantGuard);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: Get all tasks (admin → all org tasks, member → own tasks)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by task title
 *     responses:
 *       200:
 *         description: List of tasks with pagination
 *       401:
 *         description: Unauthorized
 */
router.route('/')
  .get(memberOrAdmin, listTaskRules, validate, taskController.getAll)

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       201:
 *         description: Task created
 *       422:
 *         description: Validation error
 */
  .post(memberOrAdmin, createTaskRules, validate, taskController.create);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task found
 *       404:
 *         description: Task not found
 *   put:
 *     summary: Update a task (admin → any, member → own only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       200:
 *         description: Task updated
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 *   delete:
 *     summary: Delete a task (admin → any, member → own only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task deleted
 *       403:
 *         description: Access denied
 *       404:
 *         description: Task not found
 */
router.route('/:id')
  .get(memberOrAdmin, mongoIdParam, validate, taskController.getOne)
  .put(memberOrAdmin, updateTaskRules, validate, taskController.update)
  .delete(memberOrAdmin, mongoIdParam, validate, taskController.delete);

module.exports = router;
