import { format } from "date-fns"

export function generateTaskUpdateEmailHtml(task: any) {
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "to do":
        return "status-todo"
      case "in progress":
        return "status-inprogress"
      case "done":
        return "status-done"
      default:
        return ""
    }
  }

  const getPriorityClass = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "priority-high"
      case "medium":
        return "priority-medium"
      case "low":
        return "priority-low"
      default:
        return ""
    }
  }

  const assignedToName = task.assignee
    ? `${task.assignee.first_name} ${task.assignee.last_name}`
    : "Unassigned"

  const assignedByName = task.assignor
    ? `${task.assignor.first_name} ${task.assignor.last_name}`
    : "System"

  const formattedUpdatedAt = task.updated_at
    ? format(new Date(task.updated_at), "MMMM d, yyyy 'at' h:mm a")
    : "N/A"

  const taskLink = `YOUR_APP_BASE_URL/dashboard/project/${task.project_id}/task/${task.id}`

  return `
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Task Update Notification</title>
        <style>
            /* Reset styles for email clients */
            body, table, td, p, a, li, blockquote {
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
            }
            table, td {
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
            }
            img {
                -ms-interpolation-mode: bicubic;
                border: 0;
                height: auto;
                line-height: 100%;
                outline: none;
                text-decoration: none;
            }
            
            /* Main styles */
            body {
                margin: 0 !important;
                padding: 0 !important;
                background-color: #f4f4f4;
                font-family: Arial, sans-serif;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
            }
            
            .header {
                background-color: #2563eb;
                padding: 20px;
                text-align: center;
            }
            
            .header h1 {
                color: #ffffff;
                margin: 0;
                font-size: 24px;
                font-weight: bold;
            }
            
            .content {
                padding: 30px;
            }
            
            .task-card {
                background-color: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            
            .task-title {
                font-size: 20px;
                font-weight: bold;
                color: #1e293b;
                margin: 0 0 10px 0;
            }
            
            .task-meta {
                display: table;
                width: 100%;
                margin: 15px 0;
            }
            
            .meta-row {
                display: table-row;
            }
            
            .meta-label {
                display: table-cell;
                font-weight: bold;
                color: #64748b;
                padding: 5px 15px 5px 0;
                width: 120px;
            }
            
            .meta-value {
                display: table-cell;
                color: #1e293b;
                padding: 5px 0;
            }
            
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                text-transform: uppercase;
            }
            
            .status-todo {
                background-color: #fef3c7;
                color: #92400e;
            }
            
            .status-inprogress {
                background-color: #dbeafe;
                color: #1e40af;
            }
            
            .status-done {
                background-color: #d1fae5;
                color: #065f46;
            }
            
            .priority-high {
                color: #dc2626;
                font-weight: bold;
            }
            
            .priority-medium {
                color: #ea580c;
                font-weight: bold;
            }
            
            .priority-low {
                color: #16a34a;
                font-weight: bold;
            }
            
            .description {
                background-color: #ffffff;
                border-left: 4px solid #2563eb;
                padding: 15px;
                margin: 15px 0;
            }
            
            .description h3 {
                margin: 0 0 10px 0;
                color: #1e293b;
                font-size: 16px;
            }
            
            .description ul {
                margin: 10px 0;
                padding-left: 20px;
            }
            
            .description li {
                color: #64748b;
                margin: 5px 0;
            }
            
            .action-button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #2563eb;
                color: #ffffff;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                margin: 20px 0;
            }
            
            .footer {
                background-color: #f1f5f9;
                padding: 20px;
                text-align: center;
                border-top: 1px solid #e2e8f0;
            }
            
            .footer p {
                color: #64748b;
                font-size: 14px;
                margin: 5px 0;
            }
            
            /* Mobile responsive */
            @media only screen and (max-width: 600px) {
                .email-container {
                    width: 100% !important;
                }
                
                .content {
                    padding: 20px !important;
                }
                
                .task-meta {
                    display: block !important;
                }
                
                .meta-row {
                    display: block !important;
                    margin: 10px 0 !important;
                }
                
                .meta-label, .meta-value {
                    display: block !important;
                    width: 100% !important;
                    padding: 2px 0 !important;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="header">
                <h1>🔔 Task Update Notification</h1>
            </div>
            
            <!-- Main Content -->
            <div class="content">
                <p>Hello there,</p>
                <p>A task has been updated in your project. Here are the details:</p>
                
                <!-- Task Card -->
                <div class="task-card">
                    <div class="task-title">${task.task_title || "N/A"}</div>
                    
                    <div class="task-meta">
                        <div class="meta-row">
                            <div class="meta-label">Project:</div>
                            <div class="meta-value">${task.project_name || "N/A"}</div>
                        </div>
                        <div class="meta-row">
                            <div class="meta-label">Task ID:</div>
                            <div class="meta-value">${task.task_num || "N/A"}</div>
                        </div>
                        <div class="meta-row">
                            <div class="meta-label">Status:</div>
                            <div class="meta-value">
                                <span class="status-badge ${getStatusBadgeClass(task.status_name || "")}">${task.status_name || "N/A"}</span>
                            </div>
                        </div>
                        <div class="meta-row">
                            <div class="meta-label">Priority:</div>
                            <div class="meta-value">
                                <span class="${getPriorityClass(task.task_priority || "")}">${task.task_priority || "N/A"}</span>
                            </div>
                        </div>
                        <div class="meta-row">
                            <div class="meta-label">Assigned To:</div>
                            <div class="meta-value">${assignedToName}</div>
                        </div>
                        <div class="meta-row">
                            <div class="meta-label">Assigned By:</div>
                            <div class="meta-value">${assignedByName}</div>
                        </div>
                        <div class="meta-row">
                            <div class="meta-label">Issue Type:</div>
                            <div class="meta-value">${task.task_type || "N/A"}</div>
                        </div>
                        <div class="meta-row">
                            <div class="meta-label">Updated:</div>
                            <div class="meta-value">${formattedUpdatedAt}</div>
                        </div>
                    </div>
                    
                    <!-- Description -->
                    <div class="description">
                        <h3>Description:</h3>
                        <div>
                           ${task.description || "No description provided."}
                        </div>
                    </div>
                    
                    <!-- Action Button -->
                    <center>
                        <a href="${taskLink}" class="action-button">View Task Details</a>
                    </center>
                </div>
                
                <p>You can click the button above to view the full task details and make any necessary updates.</p>
                <p>Best regards,<br>Your Project Management System</p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p>This is an automated notification from your project management system.</p>
                <p>If you no longer wish to receive these notifications, you can update your preferences in your account settings.</p>
            </div>
        </div>
    </body>
    </html>`
}
