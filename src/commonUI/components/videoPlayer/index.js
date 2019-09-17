import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {Image, ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View, ViewPropTypes} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video'; // eslint-disable-line

import {addZero} from '../../../pages/nettmp'
import {em} from '../../base';

const BackgroundImage = ImageBackground || Image; // fall back to Image if RN < 0.46

const styles = StyleSheet.create({
    preloadingPlaceholder: {
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    thumbnail: {
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        width: 68*em,
        height: 68*em,
        borderRadius: 34*em,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playArrow: {
        color: 'white',
    },
    video: Platform.Version >= 24 ? {} : {
        backgroundColor: 'black',
    },
    controls: {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        height: 48*em,
        marginTop: -48*em,
        flexDirection: 'row',
        alignItems: 'center',
    },
    playControl: {
        color: 'white',
        padding: 8*em,
    },
    extraControl: {
        color: 'white',
        padding: 8*em,
    },
    seekBar: {
        alignItems: 'center',
        height: 30*em,
        flexGrow: 1,
        flexDirection: 'row',
        paddingHorizontal: 10*em,
        marginLeft: 10*em,
        marginRight: 5*em,
    },
    seekBarFullWidth: {
        marginLeft: 0,
        marginRight: 0,
        paddingHorizontal: 0,
        marginTop: -3*em,
        height: 4*em,
    },
    seekBarProgress: {
        height: 4*em,
        backgroundColor: '#046390',
    },
    seekBarKnob: {
        width: 20*em,
        height: 20*em,
        marginHorizontal: -8*em,
        marginVertical: -10*em,
        borderRadius: 10*em,
        backgroundColor: '#FFF',
        transform: [{ scale: 0.8 }],
        zIndex: 1,
    },
    seekBarBackground: {
        backgroundColor: '#fff',
        height: 4*em,
    },
    overlayButton: {
        flex: 1,
    },
});

export default class VideoPlayer extends Component {
    constructor(props) {
        super(props);

        var str = this.makeTimeText(props.duration);
        this.state = {
            isStarted: props.autoplay,
            isPlaying: props.autoplay,
            width: 200*em,
            progress: 0,
            isMuted: props.defaultMuted,
            isControlsVisible: !props.hideControlsOnStart,
            duration: props.duration,
            isSeeking: false,
            durationText: str,
            currentTime: 0,
            currentText: '00:00:00',
        };

        this.seekBarWidth = 200*em;
        this.wasPlayingBeforeSeek = props.autoplay;
        this.seekTouchStart = 0;
        this.seekProgressStart = 0;

        this.onLayout = this.onLayout.bind(this);
        this.onStartPress = this.onStartPress.bind(this);
        this.onProgress = this.onProgress.bind(this);
        this.onEnd = this.onEnd.bind(this);
        this.onLoad = this.onLoad.bind(this);
        this.onPlayPress = this.onPlayPress.bind(this);
        this.onMutePress = this.onMutePress.bind(this);
        this.showControls = this.showControls.bind(this);
        this.onToggleFullScreen = this.onToggleFullScreen.bind(this);
        this.onSeekBarLayout = this.onSeekBarLayout.bind(this);
        this.onSeekGrant = this.onSeekGrant.bind(this);
        this.onSeekRelease = this.onSeekRelease.bind(this);
        this.onSeek = this.onSeek.bind(this);
    }

    componentDidMount() {
        if (this.props.autoplay) {
            this.hideControls();
        }
        if( this.props.thumbnail ) {
            this.setState(state => ({
                isPlaying: true,
                progress: state.progress === 1 ? 0 : state.progress,
            }));
        }
    }

    componentWillUnmount() {
        if (this.controlsTimeout) {
            clearTimeout(this.controlsTimeout);
            this.controlsTimeout = null;
        }
    }

    onLayout(event) {
        const { width } = event.nativeEvent.layout;
        this.setState({
            width,
        });
    }

    onStartPress() {
        if (this.props.onStart) {
            this.props.onStart();
        }

        this.setState(state => ({
            isPlaying: true,
            isStarted: true,
            progress: state.progress === 1 ? 0 : state.progress,
        }));

        this.hideControls();
    }

    onProgress(event) {
        if( !this.state.isStarted ) {
            this.stop();
            return;
        }
        if (this.state.isSeeking) {
            return;
        }
        if (this.props.onProgress) {
            this.props.onProgress(event);
        }
        this.setState({
            progress: (event.currentTime) / (this.props.duration || this.state.duration),
            currentText: this.makeTimeText(event.currentTime),
        });
    }

    onEnd(event) {
        if (this.props.onEnd) {
            this.props.onEnd(event);
        }

        if (this.props.endWithThumbnail) {
            this.setState({ isStarted: false });
            if( this.props.onFullscreen )
                this.props.onFullscreen(false);
            this.player.dismissFullscreenPlayer();
        }

        this.setState({ progress: 1 });

        if (!this.props.loop) {
            this.setState(
                { isPlaying: false },
                () => this.player && this.player.seek(0)
            );
        } else {
            this.player.seek(0);
        }
    }

    onLoad(event) {
        if (this.props.onLoad) {
            this.props.onLoad(event);
        }

        const { duration } = event;
        this.setState({ duration });
    }

    onPlayPress() {
        if (this.props.onPlayPress) {
            this.props.onPlayPress();
        }

        this.setState({
            isPlaying: !this.state.isPlaying,
        });
        this.showControls();
    }

    onMutePress() {
        const isMuted = !this.state.isMuted;
        if (this.props.onMutePress) {
            this.props.onMutePress(isMuted);
        }
        this.setState({
            isMuted,
        });
        this.showControls();
    }

    onToggleFullScreen() {
        if( this.props.onFullscreen )
            this.props.onFullscreen(this.props.fullscreen==true?false:true);
//        this.player.presentFullscreenPlayer();
    }

    onSeekBarLayout({ nativeEvent }) {
        const customStyle = this.props.customStyles.seekBar;
        let padding = 0;
        if (customStyle && customStyle.paddingHorizontal) {
            padding = customStyle.paddingHorizontal * 2;
        } else if (customStyle) {
            padding = customStyle.paddingLeft || 0;
            padding += customStyle.paddingRight ? customStyle.paddingRight : 0;
        } else {
            padding = 20*em;
        }

        this.seekBarWidth = nativeEvent.layout.width - padding;
    }

    onSeekStartResponder() {
        return true;
    }

    onSeekMoveResponder() {
        return true;
    }

    onSeekGrant(e) {
        this.seekTouchStart = e.nativeEvent.pageX;
        this.seekProgressStart = this.state.progress;
        this.wasPlayingBeforeSeek = this.state.isPlaying;
        this.setState({
            isSeeking: true,
            isPlaying: false,
        });
    }

    onSeekRelease() {
        var time = this.state.progress * this.state.duration;
        var str = this.makeTimeText(time);
        this.setState({
            isSeeking: false,
            isPlaying: this.wasPlayingBeforeSeek,
            currentTime: time,
            currentText: str,
        });

        this.showControls();
    }

    onSeek(e) {
        const diff = e.nativeEvent.pageX - this.seekTouchStart;
        const ratio = 100 / this.seekBarWidth;
        const progress = this.seekProgressStart + ((ratio * diff) / 100);
        var time = progress * this.state.duration;
        var str = this.makeTimeText(time);

        this.setState({
            progress,
            currentTime: time,
            currentText: str,
        });

        this.player.seek(time);
    }

    makeTimeText(time) {
        var second = Math.ceil(time);
        var ss = second % 60;
        var mm = ((second - ss) / 60) % 60;
        var hh = Math.ceil((second - ss - mm * 60) / 3600);
        return (addZero(hh)+':'+addZero(mm)+':'+addZero(ss));
    }

    getSizeStyles() {
        const { videoWidth, videoHeight } = this.props;
        const { width } = this.state;
        const ratio = videoHeight / videoWidth;
        return {
            height: width * ratio,
            width,
        };
    }

    hideControls() {
        if (this.props.onHideControls) {
            this.props.onHideControls();
        }

        if (this.props.disableControlsAutoHide) {
            return;
        }

        if (this.controlsTimeout) {
            clearTimeout(this.controlsTimeout);
            this.controlsTimeout = null;
        }
        this.controlsTimeout = setTimeout(() => {
            this.setState({ isControlsVisible: false });
        }, this.props.controlsTimeout);
    }

    showControls() {
        if (this.props.onShowControls) {
            this.props.onShowControls();
        }

        this.setState({
            isControlsVisible: true,
        });
        this.hideControls();
    }

    seek(t) {
        this.player.seek(t);
    }

    stop() {
        this.setState({
            isPlaying: false,
            progress: 0,
        });
        this.seek(0);
        this.showControls();
    }

    pause() {
        this.setState({
            isPlaying: false,
        });
        this.showControls();
    }

    resume() {
        this.setState({
            isPlaying: true,
        });
        this.showControls();
    }

    renderStartButton() {
        const { customStyles } = this.props;
        if( this.props.hiddenStartButton ) return ( null )
        return (
            <TouchableOpacity style={[styles.playButton, customStyles.playButton]} onPress={this.onStartPress}>
                <Image source={require('../../images/safetystudy_play.png')} style={{width: 68*em, height: 68*em}}/>
            </TouchableOpacity>
        );
    }

    renderThumbnail() {
        const { thumbnail, style, customStyles, ...props } = this.props;
        return (
            <BackgroundImage
                {...props}
                style={[
                    styles.thumbnail,
                    this.getSizeStyles(),
                    style,
                    customStyles.thumbnail, {width: this.props.videoWidth, height: this.props.videoHeight, borderRadius: this.props.borderRadius}
                ]}
                source={thumbnail}
            >
                {this.renderStartButton()}
            </BackgroundImage>
        );
    }

    renderSeekBar(fullWidth) {
        const { customStyles, disableSeek } = this.props;
        return (
            <View style={[styles.seekBar, fullWidth ? styles.seekBarFullWidth : {},
                    customStyles.seekBar, fullWidth ? customStyles.seekBarFullWidth : {},]}
                onLayout={this.onSeekBarLayout}>
                <View style={[{ flexGrow: this.state.progress }, styles.seekBarProgress, customStyles.seekBarProgress,]}/>
                { !fullWidth && !disableSeek ? (
                    <View style={[styles.seekBarKnob, customStyles.seekBarKnob,
                            this.state.isSeeking ? { transform: [{ scale: 1 }] } : {},
                            this.state.isSeeking ? customStyles.seekBarKnobSeeking : {},]}
                        hitSlop={{ top: 20, bottom: 20, left: 10, right: 20 }}
                        onStartShouldSetResponder={this.onSeekStartResponder}
                        onMoveShouldSetPanResponder={this.onSeekMoveResponder}
                        onResponderGrant={this.onSeekGrant}
                        onResponderMove={this.onSeek}
                        onResponderRelease={this.onSeekRelease}
                        onResponderTerminate={this.onSeekRelease}/>
                ) : null }
                <View style={[styles.seekBarBackground, { flexGrow: 1 - this.state.progress }, customStyles.seekBarBackground,]} />
            </View>
        );
    }

    renderControls() {
        const { customStyles } = this.props;
        return (
            <View style={[styles.controls, customStyles.controls, {marginLeft: 30*em, marginRight: 30*em, marginBottom: 18*em, height: 30*em, alignItems: 'center'}]}>
                <TouchableOpacity onPress={this.onPlayPress} style={[customStyles.controlButton, customStyles.playControl]}>
                    <Image source={this.state.isPlaying ? require('../../images/pause.png') : require('../../images/play.png')} style={{width: 24*em, height: 29*em}}/>
                </TouchableOpacity>
                <Text style={{paddingLeft: 30*em, fontSize: 26*em, color: '#fff'}}>{this.state.currentText}</Text>
                {this.renderSeekBar()}
                {/*this.props.muted ? null : (
                    <TouchableOpacity onPress={this.onMutePress} style={customStyles.controlButton}>
                        <Icon
                            style={[styles.extraControl, customStyles.controlIcon]}
                            name={this.state.isMuted ? 'volume-off' : 'volume-up'}
                            size={24}
                        />
                    </TouchableOpacity>
                )*/}
                <Text style={{paddingRight: 32*em, fontSize: 26*em, color: '#fff'}}>{this.state.durationText}</Text>
                <TouchableOpacity onPress={this.onToggleFullScreen} style={[customStyles.controlButton]}>
                    <Image source={require('../../images/size_scale.png')} style={{width: 30*em, height: 29*em}}/>
                </TouchableOpacity>
            </View>
        );
    }

    renderVideo() {
        const {
            video,
            style,
            resizeMode,
            pauseOnPress,
            fullScreenOnLongPress,
            customStyles,
            ...props
        } = this.props;
        const { isStarted } = this.state;
        return (
            <View style={customStyles.videoWrapper}>
                <Video
                    {...props}
                        style={[styles.video, this.getSizeStyles(), style, customStyles.video,
                        {width: this.props.videoWidth, height: this.props.videoHeight, borderRadius: this.props.borderRadius}]}
                    ref={p => { this.player = p; }}
                    muted={this.props.muted || this.state.isMuted}
                    paused={this.props.paused
                        ? this.props.paused || !this.state.isPlaying
                        : !this.state.isPlaying}
                    onProgress={this.onProgress}
                    onEnd={this.onEnd}
                    onLoad={this.onLoad}
                    source={video}
                    resizeMode={resizeMode}
                />
                <View style={[this.getSizeStyles(), { marginTop: -this.getSizeStyles().height},]}>
                    <TouchableOpacity
                        style={styles.overlayButton}
                        onPress={() => {
                            this.showControls();
                            if (pauseOnPress)
                                this.onPlayPress();
                        }}
                        onLongPress={() => {
                            if (fullScreenOnLongPress && Platform.OS !== 'android')
                                this.onToggleFullScreen();
                        }}
                    />
                </View>
                {!isStarted?
                    <View style={[styles.preloadingPlaceholder, this.getSizeStyles(), style, {position: 'absolute', backgroundColor: 'transparent'}]}>
                        {this.renderStartButton()}
                    </View>:null
                }
                {!this.props.hideControlsAllways?(((!this.state.isPlaying) || this.state.isControlsVisible)
                    ? this.renderControls() : this.renderSeekBar(true)) : null}
            </View>
        );
    }

    renderContent() {
        const { thumbnail, style } = this.props;
        const { isStarted } = this.state;
/*
        if (!isStarted && thumbnail) {
            return this.renderThumbnail();
        } else if (!isStarted) {
            return (
                <View style={[styles.preloadingPlaceholder, this.getSizeStyles(), style]}>
                    {this.renderStartButton()}
                </View>
            );
        }
*/        return this.renderVideo();
    }

    render() {
        return (
          <View onLayout={this.onLayout} style={this.props.customStyles.wrapper}>
                {this.renderContent()}
          </View>
        );
    }
}

VideoPlayer.propTypes = {
    video: Video.propTypes.source,
    thumbnail: Image.propTypes.source,
    videoWidth: PropTypes.number,
    videoHeight: PropTypes.number,
    duration: PropTypes.number,
    autoplay: PropTypes.bool,
    paused: PropTypes.bool,
    defaultMuted: PropTypes.bool,
    muted: PropTypes.bool,
    style: ViewPropTypes.style,
    controlsTimeout: PropTypes.number,
    disableControlsAutoHide: PropTypes.bool,
    disableFullscreen: PropTypes.bool,
    loop: PropTypes.bool,
    resizeMode: Video.propTypes.resizeMode,
    hideControlsOnStart: PropTypes.bool,
    endWithThumbnail: PropTypes.bool,
    disableSeek: PropTypes.bool,
    pauseOnPress: PropTypes.bool,
    fullScreenOnLongPress: PropTypes.bool,
    customStyles: PropTypes.shape({
        wrapper: ViewPropTypes.style,
        video: Video.propTypes.style,
        videoWrapper: ViewPropTypes.style,
        controls: ViewPropTypes.style,
        playControl: TouchableOpacity.propTypes.style,
        controlButton: TouchableOpacity.propTypes.style,
        controlIcon: Icon.propTypes.style,
        playIcon: Icon.propTypes.style,
        seekBar: ViewPropTypes.style,
        seekBarFullWidth: ViewPropTypes.style,
        seekBarProgress: ViewPropTypes.style,
        seekBarKnob: ViewPropTypes.style,
        seekBarKnobSeeking: ViewPropTypes.style,
        seekBarBackground: ViewPropTypes.style,
        thumbnail: Image.propTypes.style,
        playButton: TouchableOpacity.propTypes.style,
        playArrow: Icon.propTypes.style,
    }),
    onEnd: PropTypes.func,
    onProgress: PropTypes.func,
    onLoad: PropTypes.func,
    onStart: PropTypes.func,
    onPlayPress: PropTypes.func,
    onHideControls: PropTypes.func,
    onShowControls: PropTypes.func,
    onMutePress: PropTypes.func,
};

VideoPlayer.defaultProps = {
    videoWidth: 1280,
    videoHeight: 720,
    autoplay: false,
    controlsTimeout: 2000,
    loop: false,
    resizeMode: 'contain',
    disableSeek: false,
    pauseOnPress: false,
    fullScreenOnLongPress: false,
    customStyles: {},
};
