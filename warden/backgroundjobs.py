import configparser
import requests
from flask import current_app as app
from flask import flash
from flask.globals import current_app
from warden_modules import regenerate_nav
from specter_importer import Specter
from config import Config
from warden_pricing_engine import fxsymbol
from message_handler import Message


# Start background threads


def background_specter_update():
    # clean old messages
    app.message_handler.clean_category('Background Job')
    message = Message(category='Background Job',
                      message_txt="<span class='text-info'>Starting Background Update</span>")
    app.message_handler.add_message(message)

    # Test: CHECK TOR
    from warden_pricing_engine import test_tor
    current_app.tor = test_tor()

    # Ping URL
    try:
        result = requests.get(app.specter.base_url)
        if result.ok:
            app.specter.specter_reached = True
            message = Message(category='Background Job',
                              message_txt="<span class='text-success'>Ping ok to Specter Server</span>")
        else:
            app.specter.specter_reached = False
            message = Message(category='Background Job',
                              message_txt="<span class='text-danger'>Could not ping Specter Server</span>")
    except Exception as e:
        app.specter.specter_reached = False
        message = Message(category='Background Job',
                          message_txt=f"<span class='text-danger'>Error pinging Specter: {e}</span>")
    # Write message
    app.message_handler.add_message(message)

    # Authenticate
    try:
        app.specter.init_session()
        app.specter.specter_auth = True
        message = Message(category='Background Job',
                          message_txt="<span class='text-success'>Authentication credentials ok to Specter Server</span>")
    except Exception as e:
        app.specter.specter_auth = False
        message = Message(category='Background Job',
                          message_txt=f"<span class='text-danger'>Error authenticating to Specter: {e}</span>")
    # Write message
    app.message_handler.add_message(message)

    # Get Gome data from specter
    metadata = app.specter.home_parser(load=False)

    # Log Home data
    if metadata['alias_list']:
        message = Message(category='Background Job',
                          message_txt='Home Data Crawler',
                          notes=f"Loaded the following wallets:<br><span class='text-success'>{metadata['alias_list']}</span>"
                          )
    else:
        message = Message(category='Background Job',
                          message_txt='Home Data Crawler',
                          notes="<span class='text-warning'>Could not get wallet info -  check Specter Server</span>"
                          )

    app.message_handler.add_message(message)
    message = Message(category='Background Job',
                      message_txt='Home Data Crawler',
                      notes=f"<span class='text-success'>Bitcoin Core is at block {metadata['bitcoin_core_data']['Blocks count']}</span>"
                      )
    app.message_handler.add_message(message)
    #  End log

    txs = app.specter.refresh_txs(load=False)

    # Log Home data
    message = Message(category='Background Job',
                      message_txt="<span class='text-success'>✅ Finished Transaction Refresh</span>",
                      notes=f"<span class='text-info'>Loaded {len(txs['txlist'])} Transactions</span>"
                      )
    app.message_handler.add_message(message)
    #  End log

    # Check wallets
    wallets = app.specter.wallet_alias_list(load=True)
    if wallets is None:
        app.specter.specter_reached = False
        specter_message = 'Having trouble finding Specter transactions. Check Specter Server'
        flash(specter_message, 'warning')

    else:
        for wallet in wallets:
            app.specter.wallet_info(wallet_alias=wallet, load=False)
            rescan = app.specter.rescan_progress(wallet_alias=wallet, load=False)
            message = Message(category='Background Job',
                              message_txt=f"<span class='text-success'>Loaded wallet {wallet} </span>",
                              notes=f"Rescan: {rescan} "
                              )
            app.message_handler.add_message(message)

    # Other checks and tests
    specter_dict, specter_messages = specter_test()
    if specter_messages:
        if 'Read timed out' in str(specter_messages):
            app.specter.specter_reached = False
            flash("Having trouble connecting to Specter. Connection timed out. Data may be outdated.", "warning")

        if 'Connection refused' in str(specter_messages):
            app.specter.specter_reached = False
            if app.specter.base_url:
                flash('Having some difficulty reaching Specter Server. ' +
                      f'Please make sure it is running at {app.specter.base_url}. Using cached data. Last Update: ' +
                      app.specter.home_parser()['last_update'], 'warning')

        if 'Unauthorized Login' in str(specter_messages):
            app.specter.specter_reached = False
            app.specter.specter_auth = False
            flash("Could not login to Specter Server [Unauthorized]. Check username and password.")

    # Success
    app.downloading = False


def background_settings_update():
    # Reload config
    config_file = Config.config_file
    config_settings = configparser.ConfigParser()
    config_settings.read(config_file)
    app.settings = config_settings
    app.fx = fxsymbol(config_settings['PORTFOLIO']['base_fx'], 'all')
    regenerate_nav()


# Check Specter health
def specter_test(force=False):
    return_dict = {}
    messages = None
    # Load basic specter data
    try:
        specter = app.specter.init_session()
        if type(specter) == str:
            if 'Specter Error' in specter:
                return_dict['specter_status'] = 'Error'
                messages = specter
                return (return_dict, messages)

    except Exception as e:
        return_dict['specter_status'] = 'Error'
        messages = str(e)

    return (return_dict, messages)
