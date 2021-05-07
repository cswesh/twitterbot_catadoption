const dotenv = require('dotenv');
const Twitter = require('twitter');
const fetch = require('node-fetch');
dotenv.config({path:'./.env'});

const twitterClient = new Twitter({
    consumer_key :process.env.TWITTER_CONSUMER_KEY,
    consumer_secret:process.env.TWITTER_CONSUMER_SECRET,
    access_token_key:process.env.TWITTER_ACCESS_KEY,
    access_token_secret:process.env.TWITTER_ACCESS_SECRET
});

const newCatsThisHour = async () =>{
    const hourAgo = new Date(new Date().getTime() - 1000 * 60 * 60).toISOString();

    let catsWithPhotos = [];

    try{
        const tokenRes = await fetch('https://api.petfinder.com/v2/oauth2/token',{
            method:'POST',
            body:`grant_type=client_credentials&client_id=${process.env.PF_API_KEY}&client_secret=${process.env.PF_SECRET_KEY}`,
            headers:{
                'Content-Type':'application/x-www-form-urlencoded',
            }
        });
        const {access_token} = await tokenRes.json();

        //console.log(access_token)

        const catRes = await fetch(
            `https://api.petfinder.com/v2/animals?type=dog&location=60610&distance=100&after=${hourAgo}`,
            {
                headers:{
                    Authorization:`Bearer ${access_token}`,
                    'Content-Type':'application/x-www-form-urlencoded',
                }
            }
        )
            const {animals} = await catRes.json();
            //console.log(animals);
            if(animals.length === 0){
                return null
            }
            if(animals.length > 0){
                // filter animals with photos
                catsWithPhotos = animals.filter(animal => animal.photos.length > 0)

                return catsWithPhotos;
            }
    }
    catch(error){
        console.error(error);
    }
}

const shareCat= async () => {
    const newCats = await newCatsThisHour();

    if(newCats){
        twitterClient.post(
            'statuses/update',
            {
                status:`I'm looking for a home! ${newCats[0].url}`,
            },
            function(error, tweet, response){
                if(!error){
                    console.log(tweet)
                }
                if(error){
                    console.log(error);
                }
            }
        )
    }
}

shareCat();

setInterval(shareCat,1000*60*60) // share every hour afterwards