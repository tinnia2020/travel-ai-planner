import type { Itinerary } from '../types';

/**
 * Generate HTML for itinerary export
 */
export const generateItineraryHTML = (itinerary: Itinerary): string => {
  return `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${itinerary.title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Noto Sans TC', sans-serif;
            background: #f8fafc;
            color: #1e293b;
            padding: 20px;
        }
        .container { max-width: 800px; margin: 0 auto; }
        .header {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            color: white;
            padding: 40px 30px;
            border-radius: 20px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);
        }
        .title { font-size: 2rem; font-weight: 700; margin-bottom: 12px; }
        .subtitle { font-size: 1.1rem; opacity: 0.9; }
        .summary {
            background: white;
            padding: 25px;
            border-radius: 16px;
            margin-bottom: 25px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-top: 15px;
        }
        .summary-item {
            padding: 12px;
            background: #f8fafc;
            border-radius: 10px;
        }
        .summary-label {
            font-size: 0.85rem;
            color: #64748b;
            margin-bottom: 4px;
        }
        .summary-value {
            font-weight: 600;
            font-size: 1.05rem;
        }
        .day-card {
            background: white;
            padding: 25px;
            border-radius: 16px;
            margin-bottom: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .day-header {
            font-size: 1.3rem;
            font-weight: 700;
            color: #6366f1;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 3px solid #eef2ff;
        }
        .activity {
            padding: 16px;
            background: #f8fafc;
            border-radius: 12px;
            margin-bottom: 12px;
            border-left: 4px solid #6366f1;
        }
        .activity-time {
            font-size: 0.85rem;
            color: #6366f1;
            font-weight: 600;
            margin-bottom: 6px;
        }
        .activity-name {
            font-weight: 600;
            font-size: 1.05rem;
            margin-bottom: 6px;
        }
        .activity-detail {
            font-size: 0.9rem;
            color: #64748b;
            margin-top: 4px;
        }
        .footer {
            text-align: center;
            color: #64748b;
            margin-top: 40px;
            padding: 20px;
            font-size: 0.9rem;
        }
        @media (max-width: 768px) {
            .summary-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="title">✈️ ${itinerary.title}</div>
            <div class="subtitle">${itinerary.destination} • ${itinerary.duration}</div>
        </div>

        <div class="summary">
            <h3 style="margin-bottom: 15px;">📋 行程概要</h3>
            <div class="summary-grid">
                <div class="summary-item">
                    <div class="summary-label">預算</div>
                    <div class="summary-value">${itinerary.summary.budget}</div>
                </div>
                <div class="summary-item">
                    <div class="summary-label">風格</div>
                    <div class="summary-value">${itinerary.summary.style}</div>
                </div>
            </div>
            ${
              itinerary.summary.highlights.length > 0
                ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                    <div style="font-weight: 600; margin-bottom: 8px;">✨ 行程亮點</div>
                    ${itinerary.summary.highlights.map((h) => `<div style="color: #64748b; margin: 4px 0;">• ${h}</div>`).join('')}
                </div>
            `
                : ''
            }
        </div>

        ${itinerary.days
          .map(
            (day) => `
            <div class="day-card">
                <div class="day-header">Day ${day.day} - ${day.title}</div>
                ${day.activities
                  .map(
                    (activity) => `
                    <div class="activity">
                        <div class="activity-time">${activity.time}</div>
                        <div class="activity-name">${activity.name}</div>
                        <div class="activity-detail">📍 ${activity.location}</div>
                        ${activity.note ? `<div class="activity-detail">💡 ${activity.note}</div>` : ''}
                    </div>
                `
                  )
                  .join('')}
            </div>
        `
          )
          .join('')}

        <div class="footer">
            由 AI 旅遊規劃助手生成 • ${new Date().toLocaleDateString('zh-TW')}
        </div>
    </div>
</body>
</html>`;
};

/**
 * Download HTML file
 */
export const downloadHTML = (html: string, filename: string): void => {
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};
