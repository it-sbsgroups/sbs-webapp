'use client';
import React, { useState } from 'react';

const defaultTemplates = {
  welcome: {
    subject: '🎉 Welcome to SBS Groups, {firstName}!',
    body: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f7fa; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px; }
    .content p { color: #333; line-height: 1.6; font-size: 16px; }
    .highlight { background: #f0f4ff; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to SBS Groups! 🎉</h1>
    </div>
    <div class="content">
      <p>Dear <strong>{firstName} {lastName}</strong>,</p>
      <p>We're thrilled to welcome you to the SBS Groups family! Your account has been successfully created.</p>
      
      <div class="highlight">
        <p><strong>Your Details:</strong></p>
        <p>📧 Email: {email}</p>
        <p>👤 Role: {role}</p>
        <p>🏢 Department: {department}</p>
      </div>
      
      <p>We're excited to have you on board and look forward to achieving great things together!</p>
      <p>Best regards,<br><strong>SBS Groups Team</strong></p>
    </div>
    <div class="footer">
      <p>© 2026 SBS Groups. All rights reserved.</p>
      <p>This is an automated message, please do not reply.</p>
    </div>
  </div>
</body>
</html>`
  },
  announcement: {
    subject: '📢 Important Announcement from SBS Groups',
    body: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f4f7fa; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; }
    .content { padding: 40px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📢 Company Announcement</h1>
    </div>
    <div class="content">
      <p>Dear {firstName},</p>
      <p>{customMessage}</p>
      <p>Best regards,<br><strong>SBS Groups Management</strong></p>
    </div>
    <div class="footer">
      <p>© 2026 SBS Groups. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
  },
  holiday: {
    subject: '🎊 Holiday Wishes from SBS Groups',
    body: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; background: #f4f7fa; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 40px; text-align: center; }
    .header h1 { color: #2d3748; margin: 0; font-size: 28px; }
    .content { padding: 40px; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎊 Happy Holidays!</h1>
    </div>
    <div class="content">
      <p>Dear {firstName},</p>
      <p>{customMessage}</p>
      <p>Warm wishes,<br><strong>SBS Groups Family</strong></p>
    </div>
    <div class="footer">
      <p>© 2026 SBS Groups. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`
  }
};

export default function EmailComposer({ employee, onClose, onSend }) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('welcome');
  const [previewMode, setPreviewMode] = useState(false);

  const applyTemplate = (templateKey) => {
    setSelectedTemplate(templateKey);
    const template = defaultTemplates[templateKey];
    
    // Replace placeholders
    let filledSubject = template.subject
      .replace(/{firstName}/g, employee.firstName)
      .replace(/{lastName}/g, employee.lastName)
      .replace(/{email}/g, employee.email)
      .replace(/{role}/g, employee.role || 'employee')
      .replace(/{department}/g, employee.department || 'N/A');
    
    let filledBody = template.body
      .replace(/{firstName}/g, employee.firstName)
      .replace(/{lastName}/g, employee.lastName)
      .replace(/{email}/g, employee.email)
      .replace(/{role}/g, employee.role || 'employee')
      .replace(/{department}/g, employee.department || 'N/A')
      .replace(/{customMessage}/g, customMessage || 'Thank you for being a valued member of our team.');
    
    setSubject(filledSubject);
    setBody(filledBody);
  };

  const handleSend = () => {
    onSend({
      to: employee.email,
      subject,
      html: body,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">Compose Email</h2>
            <p className="text-gray-400 text-sm mt-1">
              To: {employee.firstName} {employee.lastName} ({employee.email})
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`px-4 py-2 rounded-xl text-sm transition-all ${
                previewMode 
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' 
                  : 'bg-white/5 text-gray-400 border border-white/10'
              }`}
            >
              {previewMode ? '✏️ Edit' : '👁️ Preview'}
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">
              ✕
            </button>
          </div>
        </div>

        <div className="flex h-full">
          {/* Template Selection */}
          <div className="w-64 border-r border-white/10 p-4">
            <h3 className="text-white font-medium mb-4">Templates</h3>
            {Object.keys(defaultTemplates).map((key) => (
              <button
                key={key}
                onClick={() => applyTemplate(key)}
                className={`w-full text-left px-4 py-3 rounded-xl mb-2 transition-all ${
                  selectedTemplate === key
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {key === 'welcome' && '🎉 Welcome'}
                {key === 'announcement' && '📢 Announcement'}
                {key === 'holiday' && '🎊 Holiday'}
              </button>
            ))}
          </div>

          {/* Email Editor */}
          <div className="flex-1 p-6">
            {previewMode ? (
              <div className="bg-white rounded-xl overflow-hidden">
                <iframe
                  srcDoc={body}
                  className="w-full h-[600px] border-0"
                  title="Email Preview"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Custom Message (for templates)</label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => {
                      setCustomMessage(e.target.value);
                      applyTemplate(selectedTemplate);
                    }}
                    rows="2"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">HTML Body</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows="15"
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <p className="text-gray-500 text-sm">
            ✨ Use placeholders: {'{firstName}'}, {'{lastName}'}, {'{email}'}, {'{role}'}, {'{department}'}
          </p>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all"
            >
              📧 Send Email
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}