from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base


# Directly put the database URL here
DATABASE_URL = "postgresql://todo_list_db_722s_user:LcHpcJOexpy9Q7rSvmrargzkHrMc2iZy@dpg-cvn47di4d50c73ft4qh0-a.oregon-postgres.render.com/todo_list_db_722s"

# Special connect args for SQLite, PostgreSQL doesn't need this
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

# Create the SQLAlchemy engine using the DATABASE_URL
engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=True)

# SessionLocal is the session maker that will be used to interact with the DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all models
Base = declarative_base()