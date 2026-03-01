import os
import io
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import create_engine, text

app = FastAPI(title="Placement Analytics Service")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "placement")
DB_USER = os.getenv("DB_USER", "placement_user")
DB_PASS = os.getenv("DB_PASS", "placement_pass")

DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"


def get_engine():
    ssl_args = {"ssl": {"verify_cert": False}}
    return create_engine(DATABASE_URL, connect_args=ssl_args, pool_pre_ping=True)


def figure_to_response(fig):
    buf = io.BytesIO()
    fig.savefig(buf, format="png", bbox_inches="tight", dpi=120)
    plt.close(fig)
    buf.seek(0)
    return StreamingResponse(buf, media_type="image/png")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/branch-graph/{branch}")
def branch_graph(branch: str):
    """Bar chart: number of selected students per company for a given branch."""
    try:
        engine = get_engine()
        query = text("""
            SELECT c.name AS company_name,
                   COUNT(a.id) AS selected_count
            FROM application a
            JOIN drive d ON a.drive_id = d.id
            JOIN company c ON d.company_id = c.id
            JOIN users u ON a.student_id = u.id
            WHERE u.branch = :branch
              AND a.status = 'SELECTED'
            GROUP BY c.name
            ORDER BY selected_count DESC
        """)
        with engine.connect() as conn:
            df = pd.read_sql(query, conn, params={"branch": branch})

        if df.empty:
            # Return an info chart
            fig, ax = plt.subplots(figsize=(8, 4))
            ax.text(0.5, 0.5, f"No placement data for branch: {branch}",
                    ha='center', va='center', fontsize=14, color='gray')
            ax.axis('off')
            ax.set_title(f"Branch Analytics - {branch}", fontsize=16, fontweight='bold')
            return figure_to_response(fig)

        fig, ax = plt.subplots(figsize=(10, 6))
        colors = plt.cm.viridis([i / len(df) for i in range(len(df))])
        bars = ax.bar(df['company_name'], df['selected_count'], color=colors, edgecolor='white', linewidth=0.5)
        ax.bar_label(bars, padding=3, fontsize=11, fontweight='bold')
        ax.set_xlabel("Company", fontsize=12)
        ax.set_ylabel("Students Selected", fontsize=12)
        ax.set_title(f"Placements by Company – Branch: {branch.upper()}", fontsize=15, fontweight='bold', pad=15)
        ax.tick_params(axis='x', rotation=30)
        ax.set_facecolor('#f9f9f9')
        fig.patch.set_facecolor('#ffffff')
        fig.tight_layout()
        return figure_to_response(fig)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/company-graph/{company_id}")
def company_graph(company_id: int):
    """Pie chart: application status distribution for a given company."""
    try:
        engine = get_engine()
        query = text("""
            SELECT a.status, COUNT(a.id) AS count
            FROM application a
            JOIN drive d ON a.drive_id = d.id
            WHERE d.company_id = :company_id
            GROUP BY a.status
        """)
        with engine.connect() as conn:
            df = pd.read_sql(query, conn, params={"company_id": company_id})

        company_query = text("SELECT name FROM company WHERE id = :id")
        with engine.connect() as conn:
            result = conn.execute(company_query, {"id": company_id}).fetchone()
        company_name = result[0] if result else f"Company {company_id}"

        if df.empty:
            fig, ax = plt.subplots(figsize=(8, 4))
            ax.text(0.5, 0.5, f"No application data for company: {company_name}",
                    ha='center', va='center', fontsize=14, color='gray')
            ax.axis('off')
            ax.set_title(f"Company Analytics – {company_name}", fontsize=16, fontweight='bold')
            return figure_to_response(fig)

        status_colors = {
            'APPLIED': '#4e79a7',
            'ONGOING': '#f28e2b',
            'REJECTED': '#e15759',
            'SELECTED': '#59a14f'
        }
        colors = [status_colors.get(s, '#999999') for s in df['status']]

        fig, ax = plt.subplots(figsize=(8, 8))
        wedges, texts, autotexts = ax.pie(
            df['count'], labels=df['status'], autopct='%1.1f%%',
            colors=colors, startangle=140,
            wedgeprops=dict(edgecolor='white', linewidth=2)
        )
        for text in autotexts:
            text.set_fontsize(12)
            text.set_fontweight('bold')
        ax.set_title(f"Application Status Distribution\n{company_name}", fontsize=14, fontweight='bold', pad=20)
        fig.patch.set_facecolor('#ffffff')
        return figure_to_response(fig)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/student-graph/{roll_no}")
def student_graph(roll_no: str):
    """Bar chart: application status breakdown for a specific student."""
    try:
        engine = get_engine()
        query = text("""
            SELECT c.name AS company_name, a.status
            FROM application a
            JOIN drive d ON a.drive_id = d.id
            JOIN company c ON d.company_id = c.id
            JOIN users u ON a.student_id = u.id
            WHERE u.roll_no = :roll_no
            ORDER BY a.updated_at DESC
        """)
        with engine.connect() as conn:
            df = pd.read_sql(query, conn, params={"roll_no": roll_no})

        student_query = text("SELECT name FROM users WHERE roll_no = :roll_no")
        with engine.connect() as conn:
            result = conn.execute(student_query, {"roll_no": roll_no}).fetchone()
        student_name = result[0] if result else roll_no

        if df.empty:
            fig, ax = plt.subplots(figsize=(8, 4))
            ax.text(0.5, 0.5, f"No application data for student: {roll_no}",
                    ha='center', va='center', fontsize=14, color='gray')
            ax.axis('off')
            ax.set_title(f"Student Analytics – {student_name}", fontsize=16, fontweight='bold')
            return figure_to_response(fig)

        status_colors = {
            'APPLIED': '#4e79a7',
            'ONGOING': '#f28e2b',
            'REJECTED': '#e15759',
            'SELECTED': '#59a14f'
        }
        colors = [status_colors.get(s, '#aaaaaa') for s in df['status']]

        fig, ax = plt.subplots(figsize=(max(8, len(df) * 1.5), 6))
        bars = ax.bar(df['company_name'], [1] * len(df), color=colors, edgecolor='white', linewidth=1)
        ax.set_yticks([])
        for bar, status in zip(bars, df['status']):
            ax.text(bar.get_x() + bar.get_width() / 2, 0.5, status,
                    ha='center', va='center', fontsize=10, fontweight='bold', color='white')
        ax.set_xlabel("Company", fontsize=12)
        ax.set_title(f"Application History – {student_name} ({roll_no})", fontsize=14, fontweight='bold', pad=15)
        ax.tick_params(axis='x', rotation=30)
        ax.set_facecolor('#f9f9f9')
        fig.patch.set_facecolor('#ffffff')
        fig.tight_layout()
        return figure_to_response(fig)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
