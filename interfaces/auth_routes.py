import os

# ⚠️ Solo para desarrollo local (HTTP)
# ❌ COMENTAR ESTA LÍNEA EN PRODUCCIÓN (cuando uses HTTPS real)
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

from flask import Blueprint, redirect, session, jsonify, request, url_for
from google_auth_oauthlib.flow import Flow
import pathlib

auth_bp = Blueprint('auth', __name__)

# Ruta a tu archivo credentials.json
GOOGLE_CLIENT_SECRET_FILE = os.path.join(pathlib.Path(__file__).parent.parent, "credentials.json")

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/calendar.readonly"
]

@auth_bp.route('/auth/login')
def login():
    flow = Flow.from_client_secrets_file(
        GOOGLE_CLIENT_SECRET_FILE,
        scopes=SCOPES,
        redirect_uri=url_for('auth.callback', _external=True)
    )
    auth_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )
    session['state'] = state
    return redirect(auth_url)


@auth_bp.route('/auth/callback')
def callback():
    if 'state' not in session:
        return jsonify({"error": "Estado de sesión inválido."}), 400

    flow = Flow.from_client_secrets_file(
        GOOGLE_CLIENT_SECRET_FILE,
        scopes=SCOPES,
        state=session['state'],
        redirect_uri=url_for('auth.callback', _external=True)
    )
    flow.fetch_token(authorization_response=request.url)

    credentials = flow.credentials
    session['credentials'] = {
        'token': credentials.token,
        'refresh_token': credentials.refresh_token,
        'token_uri': credentials.token_uri,
        'client_id': credentials.client_id,
        'client_secret': credentials.client_secret,
        'scopes': credentials.scopes
    }

    return redirect("/")  # Regresa al frontend


@auth_bp.route('/auth/logout')
def logout():
    session.pop('credentials', None)
    return jsonify({"status": "logged_out"})


@auth_bp.route('/auth/status')
def status():
    return jsonify({"logged_in": 'credentials' in session})
