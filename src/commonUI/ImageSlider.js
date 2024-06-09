import React, {Component} from 'react';
import {
  Image,
  View,
  ScrollView,
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

class ImageSlider extends Component {
  state = {
    position: 0,
    width: Dimensions.get('window').width,
    onPositionChangedCalled: false,
    interval: null,
  };

  _ref = null;

  _onRef = ref => {
    this._ref = ref;
    if (ref && this.state.position !== this._getPosition()) {
      this._move(this._getPosition());
    }
  };

  _popHelperView = () =>
    !this.props.loopBothSides &&
    this._getPosition() === 0 && (
      <View style={{position: 'absolute', width: 50, height: '100%'}} />
    );

  _move = (index, animated = true, autoCalled = true) => {
    if (!this.props.autoPlayFlag && autoCalled) {
      return;
    }
    const isUpdating = index !== this._getPosition();
    const x =
      (this.props.imagesWidth
        ? this.props.imagesWidth
        : Dimensions.get('window').width) * index;

    this._ref && this._ref.scrollTo({y: 0, x, animated});

    this.setState({position: index});

    if (
      isUpdating &&
      this.props.onPositionChanged &&
      index < this.props.images.length &&
      index > -1
    ) {
      this.props.onPositionChanged(index);
      this.setState({onPositionChangedCalled: true});
    }

    this._setInterval();
  };

  _getPosition() {
    if (typeof this.props.position === 'number') {
      return this.props.position % this.props.images.length;
    }
    return this.state.position % this.props.images.length;
  }

  componentDidUpdate(prevProps) {
    const {position, autoPlayFlag} = this.props;
    if (position && prevProps.position !== position) {
      this._move(position);
    }
  }

  _clearInterval = () =>
    this.state.interval && clearInterval(this.state.interval);

  _setInterval = () => {
    this._clearInterval();
    const {autoPlayWithInterval, images, loop, loopBothSides} = this.props;

    if (autoPlayWithInterval) {
      this.setState({
        interval: setInterval(
          () =>
            this._move(
              !(loop || loopBothSides) &&
                this.state.position === images.length - 1
                ? 0
                : this.state.position + 1,
            ),
          autoPlayWithInterval,
        ),
      });
    }
  };

  _handleScroll = event => {
    const {position, width} = this.state;
    const {loop, loopBothSides, images, onPositionChanged} = this.props;
    const {x} = event.nativeEvent.contentOffset;

    if ((loop || loopBothSides) && x >= width * images.length) {
      return this._move(0, false);
    } else if (loopBothSides && x <= -width) {
      return this._move(images.length - 1, false);
    }

    let newPosition = 0;

    if (position !== -1 && position !== images.length) {
      newPosition = Math.round(event.nativeEvent.contentOffset.x / width);
      this.setState({position: newPosition});
    }

    if (
      onPositionChanged &&
      !this.state.onPositionChangedCalled &&
      newPosition < images.length &&
      newPosition > -1
    ) {
      onPositionChanged(newPosition);
    } else {
      this.setState({onPositionChangedCalled: false});
    }

    this._setInterval();
  };

  componentDidMount() {
    this._setInterval();
  }

  componentWillUnmount() {
    this._clearInterval();
  }

  _onLayout = () => {
    this.setState({width: Dimensions.get('window').width});
    this._move(this.state.position, false);
  };

  _renderImage = (image, index) => {
    const {width} = Dimensions.get('window');
    const {onPress, customSlide} = this.props;
    const offset = {marginLeft: index === -1 ? -width : 0};
    const imageStyle = [styles.image, {width}, offset];

    if (customSlide) {
      return customSlide({item: image, style: imageStyle, index, width});
    }

    const imageObject = typeof image === 'string' ? {uri: image} : image;
    const imageComponent = (
      <Image
        key={index}
        source={imageObject}
        style={imageStyle}
        onError={e => console.log('Image load error:', e)}
      />
    );

    if (onPress) {
      return (
        <TouchableOpacity
          key={index}
          style={[imageStyle, offset]}
          onPress={() => onPress && onPress({image, index})}
          delayPressIn={200}>
          {imageComponent}
        </TouchableOpacity>
      );
    }

    return imageComponent;
  };

  _scrollEnabled = position =>
    position !== -1 && position !== this.props.images.length;

  moveNext = () => {
    const next = (this.state.position + 1) % this.props.images.length;
    this._move(next, true, false);
  };

  movePrev = () => {
    const prev =
      (this.state.position + this.props.images.length - 1) %
      this.props.images.length;
    this._move(prev, true, false);
  };

  render() {
    const {customButtons, style, loop, images, loopBothSides} = this.props;
    const position = this._getPosition();
    const scrollEnabled = this._scrollEnabled(position);

    return (
      <View style={[styles.container, style]} onLayout={this._onLayout}>
        <ScrollView
          onLayout={this._onLayout}
          ref={this._onRef}
          onMomentumScrollEnd={this._handleScroll}
          scrollEventThrottle={16}
          pagingEnabled={true}
          bounces={loopBothSides}
          contentInset={loopBothSides ? {left: this.state.width} : {}}
          horizontal={true}
          scrollEnabled={scrollEnabled}
          showsHorizontalScrollIndicator={false}
          style={[styles.scrollViewContainer, style]}>
          {loopBothSides && this._renderImage(images[images.length - 1], -1)}
          {images.map(this._renderImage)}
          {(loop || loopBothSides) &&
            this._renderImage(images[0], images.length)}
        </ScrollView>
        {customButtons ? (
          customButtons(position, this._move)
        ) : (
          <View style={styles.buttons}>
            {images.map((image, index) => (
              <TouchableHighlight
                key={index}
                underlayColor="#ccc"
                onPress={() => this._move(index)}
                style={[
                  styles.button,
                  position === index && styles.buttonSelected,
                ]}>
                <View />
              </TouchableHighlight>
            ))}
          </View>
        )}
        {this._popHelperView()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContainer: {
    flexDirection: 'row',
    backgroundColor: '#222',
  },
  image: {
    width: 200,
    height: '100%',
  },
  buttons: {
    height: 15,
    marginTop: -15,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  button: {
    margin: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    opacity: 0.9,
  },
  buttonSelected: {
    opacity: 1,
    backgroundColor: '#fff',
  },
});

export default ImageSlider;
