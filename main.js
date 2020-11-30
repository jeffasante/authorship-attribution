function wordTokenize(x){
    let pattern =  /\W/g

    return x.replace(pattern, ' ').split(' ').filter(String)
    
    
}

// prints result
const log = console.log

// get data
const url = 'data/train_tweets.txt'
const test_url = 'data/test_tweets_unlabeled.txt'

function load_data(url){
    
    var fs = require('fs');

    try {
        
            var data = fs.readFileSync(url, 'utf-8').toString().toLowerCase().split('\n');
        
        } catch(e) {
            console.log('Error:', e.stack);
        }

    return data
}

var data = load_data(url);


var tweeters_tweets = {}


data.forEach(id => {
    // skip the end of file's new line
    if (id === ''){ return };

    let tokens = wordTokenize(id);
    
    if (!tweeters_tweets[tokens[0]])
    {
        tweeters_tweets[tokens[0]] = [];
    }

    else{

        tokens.splice(1).forEach(e => {
            
            tweeters_tweets[tokens[0]].push(e)
        })

    }

})

// log(tweeters_tweets)
// log(tweeters_tweets['1548'])


whole_tweets = []
// get entire tweets
Object.values(tweeters_tweets).forEach(tweets => {
    tweets.forEach(e =>whole_tweets.push(e))
})

// log(whole_tweets.length) // 267

// how many times did a word occur in the whole_tweet
whole_tweets_freq_dist = {}

whole_tweets.forEach(token => {

    whole_tweets_freq_dist[token] =  whole_tweets_freq_dist[token] ? whole_tweets_freq_dist[token] + 1: 1;

})


// log(whole_tweets_freq_dist)


// calculate features for each subtweet
_features = new Set(Object.keys(whole_tweets_freq_dist))
feature_freqs = {}

// log(_features.size)
Object.keys(tweeters_tweets).forEach(tweeter =>{

    if (!feature_freqs[tweeter]){
        
        feature_freqs[tweeter] = {};

    }
    // log(tweeter)
    tweeters_tweets[tweeter].forEach(token => {
        let overall =  tweeters_tweets[tweeter].length;
        let presence = whole_tweets_freq_dist[token];
        feature_freqs[tweeter][token] = presence / overall;
    })

})

// log(feature_freqs)
// log(feature_freqs['9916']['eeeewwww'])


// calculate features averages and standard deviations
let tweets_features = {};

// for each feature
_features.forEach(feature => {

    tweets_features[feature] = {};

    // Mean
    // Calculate the mean of the freq. in the subtwets
    feature_avg = 0
    Object.keys(tweeters_tweets).forEach(tweeter => {
        
        if(!feature_freqs[tweeter][feature]){return;}
        else{
            feature_avg += feature_freqs[tweeter][feature];
        

        }
    })

    tweets_features[feature]['Mean'] = feature_avg / Object.keys(tweeters_tweets).length;

    feature_std = 0
    Object.keys(tweeters_tweets).forEach(tweeter => {
        
        if(!feature_freqs[tweeter][feature]){return}
        else{
            diff = feature_freqs[tweeter][feature] - tweets_features[feature]['Mean']
            feature_std += Math.pow(diff, 2)
            
        }
    
    })
    
    tweets_features[feature]['Std'] = Math.sqrt(feature_std / ((Object.keys(tweeters_tweets).length) - 1))

})

// log(tweets_features)      
// log( tweets_features[feature]['Std'])

// Calculate the z-scores
let feature_zscores = {};

Object.keys(tweeters_tweets).forEach(tweeter => {
    feature_zscores[tweeter] = {};

    _features.forEach(feature => {

        
        if (!feature_freqs[tweeter][feature] && !feature_zscores[tweeter][feature]){return}
        
    
            let feature_val = feature_freqs[tweeter][feature];
            let feature_mean = tweets_features[feature]['Mean'];
            let feature_std = tweets_features[feature]['Std'];

            feature_zscores[tweeter][feature] = (feature_val - feature_mean) / feature_std;
      
    })
})

// log(feature_zscores)
    

//// For new case --Test case

function text2Token(data){
    let testcase_tweeters_tweets = [];

    data.forEach(id => {
        // skip the end of file's new line
        if (id === ''){ return };
    
        let tokens = wordTokenize(id);
        
            tokens.forEach(e => {
                
                testcase_tweeters_tweets.push(e);
            })
    
    
    })
// log(testcase_tweeters_tweets)
    return testcase_tweeters_tweets;
}


let test_case_data = load_data(test_url);

// log(test_case_data)

// returns a dist of unique token count
function freqDist(tokens){
    
    tokens_freq_dist = {}
 
     tokens.forEach(token => {
 
         tokens_freq_dist[token] =  tokens_freq_dist[token] ? tokens_freq_dist[token] + 1: 1;
 
         
     })
 
     return tokens_freq_dist;
 }

let testcase_tokens = text2Token(test_case_data)

let overall = testcase_tokens.length;
let testcase_tokens_count = freqDist(testcase_tokens)
let testcase_freqs = {}



_features.forEach(feature => {
    // let presence = whole_tweets_freq_dist[];
    if (!testcase_tokens_count[feature]) { return }
    else{
        
        let presence = testcase_tokens_count[feature]
        testcase_freqs[feature] = presence / overall

        }
})  

// log(testcase_freqs)

// calculate the test case's feature z-scores
let = testcase_zscores = {};

_features.forEach(feature => {

    if (!testcase_freqs[feature] && !testcase_zscores[feature]){return}
        
    
        let feature_val = testcase_freqs[feature];
        let feature_mean = tweets_features[feature]['Mean'];
        let feature_std = tweets_features[feature]['Std'];

        testcase_zscores[feature] = (feature_val - feature_mean) / feature_std;
        

})


owner = {};
// Calculate the Delta
Object.keys(tweeters_tweets).forEach(tweeter => {
    let delta = 0;

    _features.forEach(feature => {

        if (!testcase_zscores[feature] || !feature_zscores[tweeter][feature]){ return}
        
        
        else{
            delta += Math.abs(testcase_zscores[feature] - feature_zscores[tweeter][feature]);
           
        }
    });

    delta /= _features.size;
    owner[tweeter] = delta;
    log('Delta score for tweeter ', tweeter,' is ', delta);

});



function getKeyByValue(dict, value){
    return (Object.keys(dict).find(k => dict[k] == value ));
}

tweet_owner_val = Math.min(...Object.values(owner))

log('\nTweeter \"', getKeyByValue(owner, tweet_owner_val), '\" is most likely the tweeter of this tweet.\n')
log('----------------------------------')
log(test_case_data)
