# MongoDB
heroku addons:add mongolab
MONGO_URL=`heroku config:get MONGOLAB_URI`
heroku config:set MONGO_URL="$MONGO_URL"

# OAuth
source ./keys.sh

URL="https://provider-google-contact.herokuapp.com"

heroku config:set GOOGLE_CONTACTS_ID="$GOOGLE_CONTACTS_ID"
heroku config:set GOOGLE_CONTACTS_SECRET="$GOOGLE_CONTACTS_SECRET"
heroku config:set GOOGLE_CONTACTS_CALLBACK_URL="$URL/init/callback"
heroku config:set GOOGLE_CONTACTS_CONNECT_URL="$URL/init/connect"

heroku config:set GOOGLE_CONTACTS_CLUESTR_ID="$GOOGLE_CONTACTS_CLUESTR_ID"
heroku config:set GOOGLE_CONTACTS_CLUESTR_SECRET="$GOOGLE_CONTACTS_CLUESTR_SECRET"