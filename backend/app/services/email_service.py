import asyncio
import aiosmtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage
from datetime import datetime
from typing import Optional
from app.core.config import settings
from app.core.logging import logger


class EmailService:
    def __init__(self):
        self.smtp_host = settings.smtp_host
        self.smtp_port = settings.smtp_port
        self.smtp_username = settings.smtp_username
        self.smtp_password = settings.smtp_password
        self.from_email = settings.smtp_from_email
        self.from_name = settings.smtp_from_name

    def _is_configured(self) -> bool:
        """Check if email service is properly configured"""
        return bool(self.smtp_host and self.smtp_username and self.smtp_password and self.from_email)

    def base_template(self, content: str) -> str:
        """Wrap content in branded SKYRA HTML template"""
        return f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>SKYRA - AI-Powered Career Intelligence</title>
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 20px;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                }}
                .header {{
                    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
                    padding: 30px;
                    text-align: center;
                }}
                .logo {{
                    max-width: 200px;
                    height: auto;
                    margin: 0 auto;
                }}
                .content {{
                    padding: 30px;
                }}
                .content h1 {{
                    color: #1e40af;
                    margin-top: 0;
                }}
                .content p {{
                    margin-bottom: 16px;
                }}
                .button {{
                    display: inline-block;
                    background-color: #3b82f6;
                    color: #ffffff;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 20px 0;
                }}
                .button:hover {{
                    background-color: #2563eb;
                }}
                .footer {{
                    background-color: #f8f9fa;
                    padding: 20px;
                    text-align: center;
                    font-size: 12px;
                    color: #6c757d;
                    border-top: 1px solid #e9ecef;
                }}
                .highlight {{
                    background-color: #eff6ff;
                    padding: 15px;
                    border-left: 4px solid #3b82f6;
                    margin: 20px 0;
                    border-radius: 4px;
                }}
                .stats {{
                    display: flex;
                    justify-content: space-around;
                    margin: 20px 0;
                }}
                .stat {{
                    text-align: center;
                }}
                .stat-value {{
                    font-size: 24px;
                    font-weight: bold;
                    color: #1e40af;
                }}
                .stat-label {{
                    font-size: 12px;
                    color: #6c757d;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="cid:skyra-logo" alt="SKYRA Logo" class="logo">
                </div>
                <div class="content">
                    {content}
                </div>
                <div class="footer">
                    <p>© 2026 SKYRA - AI-Powered Career Intelligence</p>
                    <p>This is an automated email. Please do not reply.</p>
                </div>
            </div>
        </body>
        </html>
        """

    def welcome_email(self, user_name: str) -> str:
        """Generate welcome email content"""
        content = f"""
            <h1>Welcome to SKYRA!</h1>
            <p>Hi {user_name},</p>
            <p>Welcome to SKYRA - your AI-powered career intelligence platform. We're excited to help you unlock your career potential.</p>
            <div class="highlight">
                <p><strong>What you can do with SKYRA:</strong></p>
                <ul>
                    <li>📄 Upload and analyze your resume with AI</li>
                    <li>🎯 Match your skills to top job opportunities</li>
                    <li>📝 Generate professional cover letters</li>
                    <li>🎤 Practice with AI interview coaching</li>
                    <li>📊 Analyze skill gaps and create career roadmaps</li>
                </ul>
            </div>
            <p>Get started by uploading your resume and let our AI help you stand out in your job search.</p>
            <a href="https://skyra.ai/dashboard" class="button">Go to Dashboard</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The SKYRA Team</p>
        """
        return self.base_template(content)

    def login_notification(self, user_name: str, login_time: str) -> str:
        """Generate login notification email content"""
        content = f"""
            <h1>Welcome Back to SKYRA — Login Successful</h1>
            <p>Hi {user_name},</p>
            <p>Welcome to <strong>SKYRA</strong>!</p>
            <p>We're glad to have you with us. SKYRA is built to help you understand your career better, improve your resume, discover the right opportunities, and move one step closer to your career goals.</p>
            <p>Your account has been successfully logged in.</p>
            <div class="highlight">
                <p><strong>From resume analysis and ATS scoring to AI-powered career guidance, job matching, skill-gap analysis, interview preparation, and career roadmaps — SKYRA is here to support you throughout your journey.</strong></p>
            </div>
            <p>Thank you for choosing SKYRA.</p>
            <p><em>Keep learning. Keep improving. Keep growing.</em></p>
            <p>Best regards,<br><strong>AMAAN</strong><br>Founder & Owner, SKYRA<br><em>Your AI-Powered Career Companion</em></p>
        """
        return self.base_template(content)

    def resume_analysis_email(self, user_name: str, ats_score: int) -> str:
        """Generate resume analysis email content"""
        content = f"""
            <h1>Your Resume Analysis Results</h1>
            <p>Hi {user_name},</p>
            <p>Great news! Your resume analysis is complete. Here's how your resume performed:</p>
            <div class="stats">
                <div class="stat">
                    <div class="stat-value">{ats_score}%</div>
                    <div class="stat-label">ATS Score</div>
                </div>
            </div>
            <div class="highlight">
                <p><strong>What this means:</strong></p>
                <p>Your ATS score indicates how well your resume will perform with automated screening systems used by recruiters.</p>
            </div>
            <p>View your detailed analysis including strengths, weaknesses, and personalized recommendations to improve your resume.</p>
            <a href="https://skyra.ai/dashboard" class="button">View Full Analysis</a>
            <p>Best regards,<br>The SKYRA Team</p>
        """
        return self.base_template(content)

    def job_match_email(self, user_name: str, top_job: str, match_percentage: int) -> str:
        """Generate job match email content"""
        content = f"""
            <h1>Your AI Job Match Results</h1>
            <p>Hi {user_name},</p>
            <p>Your resume has been analyzed and matched against top job roles. Here's your top match:</p>
            <div class="stats">
                <div class="stat">
                    <div class="stat-value">{match_percentage}%</div>
                    <div class="stat-label">Match Score</div>
                </div>
            </div>
            <div class="highlight">
                <p><strong>Top Match: {top_job}</strong></p>
                <p>This role aligns well with your skills and experience based on our AI analysis.</p>
            </div>
            <p>Explore all your job matches and discover new career opportunities tailored to your profile.</p>
            <a href="https://skyra.ai/dashboard" class="button">View All Matches</a>
            <p>Good luck with your job search!<br>The SKYRA Team</p>
        """
        return self.base_template(content)

    def interview_result_email(self, user_name: str, score: int, job_title: str) -> str:
        """Generate interview result email content"""
        content = f"""
            <h1>Your Interview Results</h1>
            <p>Hi {user_name},</p>
            <p>You've completed your interview practice session for <strong>{job_title}</strong>. Here's how you performed:</p>
            <div class="stats">
                <div class="stat">
                    <div class="stat-value">{score}%</div>
                    <div class="stat-label">Overall Score</div>
                </div>
            </div>
            <div class="highlight">
                <p><strong>Keep practicing!</strong></p>
                <p>Use the feedback from this session to improve your interview skills and boost your confidence.</p>
            </div>
            <p>Review your detailed feedback and practice more questions to ace your next interview.</p>
            <a href="https://skyra.ai/dashboard" class="button">View Detailed Results</a>
            <p>You're doing great!<br>The SKYRA Team</p>
        """
        return self.base_template(content)

    def cover_letter_email(self, user_name: str, company: str, job_title: str) -> str:
        """Generate cover letter email content"""
        content = f"""
            <h1>Your Cover Letter is Ready</h1>
            <p>Hi {user_name},</p>
            <p>Your professional cover letter for <strong>{job_title}</strong> at <strong>{company}</strong> has been generated!</p>
            <div class="highlight">
                <p><strong>What's next?</strong></p>
                <p>Review your cover letter, make any personal adjustments, and use it when applying for the position.</p>
            </div>
            <p>Your cover letter is tailored to highlight your relevant skills and experience for this specific role.</p>
            <a href="https://skyra.ai/dashboard" class="button">View Cover Letter</a>
            <p>Best of luck with your application!<br>The SKYRA Team</p>
        """
        return self.base_template(content)

    def skill_gap_email(self, user_name: str, target_role: str, readiness: int) -> str:
        """Generate skill gap email content"""
        content = f"""
            <h1>Your Skill Gap Analysis</h1>
            <p>Hi {user_name},</p>
            <p>Your skill gap analysis for <strong>{target_role}</strong> is complete. Here's your current readiness level:</p>
            <div class="stats">
                <div class="stat">
                    <div class="stat-value">{readiness}%</div>
                    <div class="stat-label">Role Readiness</div>
                </div>
            </div>
            <div class="highlight">
                <p><strong>What's included:</strong></p>
                <ul>
                    <li>Current skills assessment</li>
                    <li>Required skills for your target role</li>
                    <li>Missing skills to develop</li>
                    <li>Personalized learning recommendations</li>
                </ul>
            </div>
            <p>Review your analysis and create a plan to bridge any skill gaps.</p>
            <a href="https://skyra.ai/dashboard" class="button">View Analysis</a>
            <p>Keep growing!<br>The SKYRA Team</p>
        """
        return self.base_template(content)

    def career_roadmap_email(self, user_name: str, target_role: str) -> str:
        """Generate career roadmap email content"""
        content = f"""
            <h1>Your Career Roadmap is Ready</h1>
            <p>Hi {user_name},</p>
            <p>Your personalized career roadmap for <strong>{target_role}</strong> has been generated!</p>
            <div class="highlight">
                <p><strong>Your roadmap includes:</strong></p>
                <ul>
                    <li>Phase-by-phase development plan</li>
                    <li>Key milestones to achieve</li>
                    <li>Skills to acquire at each stage</li>
                    <li>Recommended resources and actions</li>
                </ul>
            </div>
            <p>Follow your roadmap to systematically progress toward your career goals.</p>
            <a href="https://skyra.ai/dashboard" class="button">View Your Roadmap</a>
            <p>Your journey to success starts now!<br>The SKYRA Team</p>
        """
        return self.base_template(content)

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str
    ) -> bool:
        """Send email using SMTP"""
        if not self._is_configured():
            logger.warning(f"Email service not configured. Skipping email send to {to_email}. Missing SMTP credentials.")
            return False

        try:
            message = MIMEMultipart("related")
            message["Subject"] = subject
            message["From"] = f"{self.from_name} <{self.from_email}>"
            message["To"] = to_email

            # Attach HTML content
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)

            # Attach SKYRA logo as inline image
            logo_path = os.path.join(os.getcwd(), "static", "skyra-logo.png")
            if os.path.exists(logo_path):
                with open(logo_path, "rb") as f:
                    logo_data = f.read()
                logo_image = MIMEImage(logo_data)
                logo_image.add_header("Content-ID", "<skyra-logo>")
                logo_image.add_header("Content-Disposition", "inline", filename="skyra-logo.png")
                message.attach(logo_image)
                logger.info(f"Attached SKYRA logo from {logo_path}")
            else:
                logger.warning(f"Logo file not found at {logo_path}, sending email without logo")

            logger.info(f"Attempting to send email to {to_email} via {self.smtp_host}:{self.smtp_port}")
            
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_username,
                password=self.smtp_password,
                start_tls=True,
            )

            logger.info(f"Email sent successfully to {to_email} with subject: {subject}")
            return True

        except aiosmtplib.SMTPAuthenticationError as e:
            logger.error(f"SMTP authentication failed for email to {to_email}: {str(e)}", exc_info=True)
            return False
        except aiosmtplib.SMTPException as e:
            logger.error(f"SMTP error occurred while sending email to {to_email}: {str(e)}", exc_info=True)
            return False
        except Exception as e:
            logger.error(f"Unexpected error sending email to {to_email}: {str(e)}", exc_info=True)
            return False


email_service = EmailService()