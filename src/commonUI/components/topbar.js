import React, {Component} from 'react';
import {
  Image,
  ImageBackground,
  StatusBar,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native';

import {colors, em} from '../base';
import bg from '../../assets/images/bg.jpg';
import Icon from 'react-native-vector-icons/MaterialIcons';
import diamond from '../../assets/images/red_diamond_trans.png';
import Global from '../../components/Global';

export class TopBar extends Component {
  constructor(props) {
    super(props);
  }

  onBack() {
    if (this.props.onBack) {
      this.props.onBack();
    }
  }

  gotoShop = () => {
    this.props.navigation.navigate('ScreenGpay01');
  };

  onAction() {
    if (this.props.onAction) {
      this.props.onAction();
    }
  }

  render() {
    return (
      <View style={this.props?.style ? this.props.style : []}>
        <StatusBar
          backgroundColor="transparent"
          barStyle="light-content"
          translucent={true}
        />
        <ImageBackground
          source={bg}
          style={{
            width: '100%',
            height: 150 * em,
            position: 'relative',
            justifyContent: 'center',
          }}>
          <View
            style={{
              position: 'absolute',
              left: 20 * em,
              top: 70 * em,
              alignSelf: 'center',
              zIndex: 2,
            }}>
            <TouchableHighlight
              style={{
                height: 75 * em,
                width: 75 * em,
                borderRadius: 5, // Make it circular for better touch area
                backgroundColor: 'transparent', // Background color should be transparent
                justifyContent: 'center',
                alignItems: 'center',
              }}
              underlayColor="rgba(0,0,0,0.2)" // Slight darkening effect when pressed
              onPress={this.onBack.bind(this)}>
              <Icon
                name="keyboard-arrow-left"
                size={36}
                color={colors.inputLabel}
              />
            </TouchableHighlight>
          </View>
          {this.props.isRequired && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                left: 20 * em,
                top: 70 * em,
                alignSelf: 'center',
                width: 60,
                height: 40,
                marginRight: 15,
                marginLeft: 30,
              }}
              onPress={() => this.gotoShop()}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image
                  source={diamond}
                  style={{
                    width: 18,
                    height: 18,
                    marginLeft: 15,
                    marginTop: 10,
                  }}
                />
                <Text
                  style={{
                    marginLeft: 10,
                    color: '#000',
                    fontSize: 12,
                    fontWeight: 'bold',
                    marginTop: 12,
                  }}>
                  {Global.saveData.coin_count}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          <View
            style={{
              position: 'absolute',
              left: this.props.isRequired ? 40 : 0,
              top: this.props.isRequired ? 82 * em : 77 * em,
              width: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 0,
            }}>
            <Text
              style={{
                color: colors.inputLabel,
                fontSize: this.props.isRequired ? 26 * em : 34 * em,
                fontWeight: 'bold',
              }}>
              {this.props.title}
            </Text>
          </View>
          {this.renderActionBtn()}
        </ImageBackground>
      </View>
    );
  }

  renderActionBtn() {
    if (this.props.actionBtn) {
      return (
        <View
          style={{
            position: 'absolute',
            right: (this.props.actionBtnImg ? 30 : 20) * em,
            top: (this.props.actionBtnImg ? 83 : 73) * em,
            width: '100%',
            alignItems: 'flex-end',
          }}>
          <TouchableOpacity onPress={this.props.actionBtn}>
            {this.props.actionBtnImg ? (
              <Image
                source={this.props.actionBtnImg}
                style={{width: 30 * em, height: 30 * em}}
              />
            ) : this.props.actionBtnIcon ? (
              <TouchableHighlight
                style={{
                  height: 75 * em,
                  width: 75 * em,
                  borderRadius: 5, // Make it circular for better touch area
                  backgroundColor: 'transparent', // Background color should be transparent
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                underlayColor="rgba(0,0,0,0.2)" // Slight darkening effect when pressed
                onPress={this.onAction.bind(this)}>
                <Icon
                  name={this.props.iconName}
                  size={32}
                  color={colors.inputLabel}
                />
              </TouchableHighlight>
            ) : (
              <Text
                style={{color: colors.primaryForeground, fontSize: 28 * em}}>
                {this.props.actionBtnTitle}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      );
    }
  }
}
