import React from 'react';
import { StyleSheet, Dimensions, ScrollView, Vibration } from 'react-native';
import { Block, theme, Text, Input, Icon } from 'galio-framework';
import { withNavigation } from '@react-navigation/compat';

import { Card, SpeakOrType } from '../components';
import articles from '../constants/articles';
const { width } = Dimensions.get('screen');
import argonTheme from "../constants/Theme";
import * as Speech from 'expo-speech';
import _ from 'lodash';

class Home extends React.Component {
  state = {
    conversation : [
      { 
        person:'virtual', 
        message: 'Welcome Alex! I am Nikki, your banking partner. Your safety is my priority. How can I help you today? You can ask.',
        speak: true
      }
    ],
    next: {
      speak: 'account balance',
      tag: 'accountBalance'
    }
  };

  constructor(props) {
      super(props)
      this.onSpeakingDone = this.onSpeakingDone.bind(this)
  }

  onSpeakingDone(text, tag){

    var newConversation = this.state.conversation;
    newConversation.push({ person : 'me', message : text, speak : false });

    var callback = null;
    var next = { speak: '', tag: ''};

    switch(tag){
      case 'accountBalance':
        this.setState({ conversation : newConversation, next : next });
        setTimeout(() => {

          var nc = this.state.conversation;
          nc.push({ person : 'virtual', message: 'Fetching account details', speak: true});

          this.setState({ conversation : nc, next : next });

          setTimeout(() => {
            nc = this.state.conversation;
            nc.push({ person : 'virtual', message: "Your account balance is 65800 EURO. Further analysing your past 6 months' transactions, I observed a constant transaction Euro 1200 to Peter Thomas for past 4 months. I presume this is your monthly lease payment. If you agree, I can categorize those transactions accordingly. Please confirm.", speak: true});
            this.setState({ conversation : nc, next : { speak : 'yes please', tag : 'analyseTransaction'} });


          }, 3000);

        }, 2000);
        break;

      case 'analyseTransaction':

        this.setState({ conversation : newConversation, next : next });
        setTimeout(() => {

          var nc = this.state.conversation;
          nc.push({ person : 'virtual', message: 'Categorizing your transactions as Monthly Lease payment', speak: true});

          this.setState({ conversation : nc, next : next });

          setTimeout(() => {
            nc = this.state.conversation;
            nc.push({ person : 'virtual', message: "I am done, also created a voice shortcut for you for future lease payment, just say 'Nikki, pay my lease'.", speak: true});
            this.setState({ conversation : nc, next : { speak : 'Nikki pay my lease', tag : 'payMyLease'} });


          }, 3000);

        }, 2000);
        break;

      case 'payMyLease':

        this.setState({ conversation : newConversation, next : next });
        setTimeout(() => {

          var nc = this.state.conversation;
          nc.push({ person : 'virtual', message: 'Fetching voice shortcut details', speak: true});

          this.setState({ conversation : nc, next : next });

          setTimeout(() => {
            nc = this.state.conversation;
            nc.push({ person : 'virtual', message: "Initializing transfer of EURO 1200 to Peter Thomas, are you sure?", speak: true});
            this.setState({ conversation : nc, next : { speak : 'Yes', tag : 'initializeTransfer'} });


          }, 3000);

        }, 2000);
        break;

      case 'initializeTransfer':

        this.setState({ conversation : newConversation, next : next });
        setTimeout(() => {

          var nc = this.state.conversation;
          nc.push({ person : 'virtual', message: 'Please wait, initializing transfer', speak: true});

          this.setState({ conversation : nc, next : next });

          setTimeout(() => {
            nc = this.state.conversation;
            nc.push({ person : 'virtual', message: "To authorise, I have sent 6 digit OTP to your registered mobile number, once received I can read out the OTP if you are in a safe and quiet place, though I recommend a headphone, otherwise I can send you a vibration indication of the OTP if you hold your phone. Would you like me to read out?", speak: true});
            this.setState({ conversation : nc, next : { speak : 'Yes', tag : 'receiveOtp'} });


          }, 3000);

        }, 2000);
        break;

      case 'receiveOtp':

        this.setState({ conversation : newConversation, next : next });
        setTimeout(() => {

          var nc = this.state.conversation;
          nc.push({ person : 'virtual', message: 'Waiting to receive OTP', speak: true});

          this.setState({ conversation : nc, next : next });

          setTimeout(() => {
            nc = this.state.conversation;
            nc.push({ person : 'virtual', message: "Your OTP is 5 6 7 8 9 0. You can type or read it back", speak: true});
            this.setState({ conversation : nc, next : { speak : '567890', tag : 'readOtp'} });


          }, 3000);

        }, 2000);
        break;

    case 'readOtp':

        this.setState({ conversation : newConversation, next : next });
        setTimeout(() => {

          var nc = this.state.conversation;
          nc.push({ person : 'virtual', message: 'Authorizing your transaction of EURO 1200 to Peter Thomas', speak: true});

          this.setState({ conversation : nc, next : next });

          setTimeout(() => {
            nc = this.state.conversation;
            nc.push({ person : 'virtual', message: "Your transaction is successful, your current account balance is EURO 64600. Would you like to continue banking?", speak: true});
            this.setState({ conversation : nc, next : { speak : 'no thanks', tag : 'stop'} });


          }, 6000);

        }, 2000);
        break;

      case 'stop':

        this.setState({ conversation : newConversation, next : next });
        setTimeout(() => {

          var nc = this.state.conversation;
          nc.push({ person : 'virtual', message: 'Thank you Alex for banking with us, I am logging you out for your safety. Keep well, good bye', speak: true});

          this.setState({ conversation : nc, next : next });

          setTimeout(() => {
            
            this.props.navigation.navigate('Onboarding');

          }, 6000);

        }, 2000);
        break;

      default:
        break;
    }

    

  }



  componentDidMount(){

    
  }

  render() {

    var lastMessage = _.last(this.state.conversation);


    if(lastMessage.speak === true){
        Speech.speak(lastMessage.message, { 
          voice: 'com.apple.ttsbundle.siri_female_en-GB_compact', onDone : () => {
        }});
    }

    return (
      <Block flex center style={styles.home}>
        <ScrollView
          ref={ref => {this.scrollView = ref}}
          onContentSizeChange={() => this.scrollView.scrollToEnd({animated: true})}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.articles}>

          <Block flex space="between">
            {
              this.state.conversation.map((item, seq) => {
                return <Block key={seq} right={item.person == 'virtual' ? false : true}>
                          <Text key={seq} h4 color={item.person == 'virtual' ? argonTheme.COLORS.PRIMARY : argonTheme.COLORS.SUCCESS}>{item.message}</Text>
                       </Block>
              })
            }
          </Block>
          
        </ScrollView>

        <SpeakOrType speakText={this.state.next.speak} tag={this.state.next.tag} speakDone={this.onSpeakingDone} />
        
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  home: {
    width: width,    
  },
  articles: {
    width: width - theme.SIZES.BASE * 2,
    paddingVertical: theme.SIZES.BASE,
  },
  input: {
    width: width - theme.SIZES.BASE * 2,
    marginBottom: 50
  },
  icon: {
    marginBottom: 30,
  }
});

export default Home;
