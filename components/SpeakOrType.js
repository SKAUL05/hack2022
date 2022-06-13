import React from 'react';
import { StyleSheet, Dimensions, ScrollView, Vibration } from 'react-native';
import { Block, theme, Text, Input, Icon } from 'galio-framework';
const { width } = Dimensions.get('screen');
import argonTheme from "../constants/Theme";


class SpeakOrType extends React.Component {
  state = {
    micColor: "red",
    text: "Type here"
  }

  constructor(props) {
      super(props)
      this.onSpeaking = this.onSpeaking.bind(this)
  }

  async componentDidMount() {

  }

  onSpeaking(){

    this.setState({ micColor: "green", text: "Type here"});

    setTimeout(() => {
      this.setState({ micColor: "green", text: this.props.speakText});

      setTimeout(() => {

        this.setState({ micColor: "red", text: "Type here"});

        if(this.props.speakDone) this.props.speakDone(this.props.speakText, this.props.tag);

      }, 1000);

      

    }, 2000);

  }

  render() {
    return(
      <Block space="between"  center style={styles.speak}>
        <Block>
          <Icon name="mic" size={50} family="Entypo" color={this.state.micColor} onPress={this.onSpeaking}  />
        </Block>
        <Block>
          <Input
            placeholder="Type here"
            color={argonTheme.COLORS.DEFAULT
            }
            style={styles.input}>{this.state.text}</Input>
        </Block>
      </Block>
    );
  }
}

const styles = StyleSheet.create({
  input: {
    width: width - theme.SIZES.BASE * 2,
    borderColor: argonTheme.COLORS.SUCCESS
  },
  speak: {
    marginBottom: 50
  }
});

export default SpeakOrType;