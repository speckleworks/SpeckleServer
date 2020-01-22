import * as THREE from 'three'

import OrbitControls from 'threejs-orbit-controls'

import Rainbow from 'rainbowvis.js'
import CH from 'color-hash'
import TWEEN from '@tweenjs/tween.js'

import Axios from 'axios'
import EE from 'event-emitter-es6'
import flatten from 'flat'
import debounce from 'lodash.debounce'

import { Converter } from './SpeckleConverter.js'
import SelectionBox from './SelectionBox.js'
import SelectionHelper from './SelectionHelper.js'

export default class SpeckleRenderer extends EE {

  constructor( { domObject }, viewerSettings ) {
    super( ) // event emitter init
    this.domObject = domObject
    this.renderer = null
    this.scene = null
    this.camera = null
    this.controls = null
    this.orbitControls = null
    this.hemiLight = null
    this.flashLight = null
    this.shadowLight = null

    this.raycaster = null
    this.mouse = null
    this.mouseDownTime = null
    this.enableKeyobardEvents = false

    this.selectionBox = null
    this.selectionHelper = null

    this.hoveredObject = null
    this.selectedObjects = [ ]
    this.highlightedObjects = [ ]

    this.hoverColor = new THREE.Color( '#EEF58F' )
    this.selectColor = new THREE.Color( '#E3E439' )

    this.sceneBoundingSphere = null

    this.colorHasher = new CH( )

    this.isSettingColors = false
    this.currentColorByProp = null
    this.colorTable = {}

    this.edgesGroup = new THREE.Group( )
    this.edgesGroup.name = 'displayEdgesGroup'
    this.edgesThreshold = null

    this.viewerSettings = viewerSettings

    this.initialise( )
  }

  initialise( ) {
    this.renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true, logarithmicDepthBuffer: true } )
    this.renderer.setSize( this.domObject.offsetWidth, this.domObject.offsetHeight )
    // this.renderer.setClearColor( new THREE.Color(  ), 0.0 )
    this.renderer.shadowMap.enabled = true
    this.domObject.appendChild( this.renderer.domElement )

    this.scene = new THREE.Scene( )

    let axesHelper = new THREE.AxesHelper( 10 )
    this.scene.add( axesHelper )

    let hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 )
    hemiLight.color = new THREE.Color( '#FFFFFF' )
    hemiLight.groundColor = new THREE.Color( '#959595' )
    hemiLight.position.set( 0, 500, 0 )
    hemiLight.isCurrent = true
    hemiLight.name = 'world lighting'
    hemiLight.up.set( 0, 0, 1 )
    this.scene.add( hemiLight )

    this.shadowLight = new THREE.DirectionalLight( 0xffffff, .5 )
    this.shadowLight.position.set( 1, 1, 5 )
    this.shadowLight.castShadow = true;
    this.shadowLight.visible = false
    this.scene.add( this.shadowLight )
    this.shadowLight.shadow.mapSize.width = 512; // default
    this.shadowLight.shadow.mapSize.height = 512; // default
    this.shadowLight.shadow.camera.near = 0.5; // default
    this.shadowLight.shadow.camera.far = 500;

    this.camera = new THREE.PerspectiveCamera( 75, this.domObject.offsetWidth / this.domObject.offsetHeight, 0.1, 100000 );
    this.camera.up.set( 0, 0, 1 )
    this.camera.position.z = 250
    this.camera.position.y = 250
    this.camera.position.x = 250

    this.camera.isCurrent = true

    let flashlight = new THREE.PointLight( new THREE.Color( '#FFFFFF' ), 0.32, 0, 1 )
    flashlight.name = 'camera light'
    this.camera.add( flashlight )

    this.controls = new OrbitControls( this.camera, this.renderer.domElement )
    this.controls.enabled = true
    this.controls.screenSpacePanning = true

    // this.controls.minPolarAngle = 0;
    // this.controls.maxPolarAngle = Math.PI / 2;

    this.edgesGroup.visible = false
    this.scene.add( this.edgesGroup )

    this.updateViewerSettings( )
    // this.controls.enableDamping = true
    // this.controls.dampingFactor = 0.45
    // this.controls = new TrackballControls( this.camera, this.renderer.domElement  )

    // if ( webpackHotUpdate ) {
    window.THREE = THREE
    // }
    // polute the global scope, why not?
    window.Converter = Converter

    this.raycaster = new THREE.Raycaster( )
    this.mouse = new THREE.Vector2( )

    this.selectionBox = new SelectionBox( this.camera, this.scene )
    this.selectionHelper = new SelectionHelper( this.selectionBox, this.renderer, "selectBox", this.controls, this.mouse )


    window.addEventListener( 'resize', this.resizeCanvas.bind( this ), false )
    this.renderer.domElement.addEventListener( 'mousemove', this.onTouchMove.bind( this ) )
    this.renderer.domElement.addEventListener( 'touchmove', this.onTouchMove.bind( this ) )

    this.renderer.domElement.addEventListener( 'mousedown', this.mouseDown.bind( this ) )
    this.renderer.domElement.addEventListener( 'mouseup', this.mouseUp.bind( this ) )

    this.domObject.addEventListener( 'mouseover', this.enableEvents.bind( this ) )
    this.domObject.addEventListener( 'mouseout', this.disableEvents.bind( this ) )

    window.addEventListener( 'keydown', this.keydown.bind( this ) )
    window.addEventListener( 'keyup', this.keyup.bind( this ) )

    // this.updateViewerSettings( )
    this.computeSceneBoundingSphere( )
    this.render( )

    //
    this.controls.addEventListener( 'change', debounce( function ( ) {
      this.emit( 'camera-pos', {
        target: [ this.controls.target.x, this.controls.target.y, this.controls.target.z ],
        position: [ this.camera.position.x, this.camera.position.y, this.camera.position.z ],
        rotation: [ this.camera.rotation.x, this.camera.rotation.y, this.camera.rotation.z ]
      } )
      this.setFar()
    }.bind( this ), 200 ) )
  }



  animate( ) {
    requestAnimationFrame( this.animate.bind( this ) );
    TWEEN.update( )
    this.setFar( )
    this.controls.update( )
    this.render( )
  }

  render( ) {
    this.renderer.render( this.scene, this.camera );
  }

  resizeCanvas( ) {
    this.camera.aspect = this.domObject.offsetWidth / this.domObject.offsetHeight
    this.camera.updateProjectionMatrix( )
    this.renderer.setSize( this.domObject.offsetWidth, this.domObject.offsetHeight )
  }

  // called on mouseover the render div - tells us we can actually enable interactions
  // in the threejs window
  enableEvents( e ) {
    this.enableKeyobardEvents = true
  }

  // called on mouseout of the render div - will stop interactions, such as spacebar
  // for zoom extents, etc. in the threejs window
  disableEvents( e ) {
    this.unHighlightObjects( )
    this.enableKeyobardEvents = false
  }

  // HIC SUNT DRACONES:
  // Selection events and mouse interactions below.
  // Main thing to note:
  // - Holding down shift will disable the orbit controls and enable draggin a selection box
  // - Double clicking on an object will zoom to it
  // - (TODO) Clicking on an object selects it
  // - (TODO) Clicking outside any objects/selection box will kill current selection

  keydown( event ) {
    if ( !this.enableKeyobardEvents ) return
    switch ( event.code ) {
      case 'Space':
        this.computeSceneBoundingSphere( )
        this.zoomExtents( )
        event.stopPropagation( )
        break
      case 'ShiftLeft':
        if ( !this.isSpinning ) {
          this.controls.enabled = false
          this.domObject.style.cursor = 'copy'
        }
        break
      default:
        break
    }
  }

  keyup( event ) {
    if ( !this.enableKeyobardEvents ) return
    // console.log( `key: ${event.code}` )
    switch ( event.code ) {
      case 'ShiftLeft':
        this.controls.enabled = true
        this.domObject.style.cursor = ''
        break
      default:
        break
    }
  }

  // we dont' do much on mouse down:
  // 1) if it's a doubleclick, and we have a hovered object, zoom to it
  // 2) if the orbit controls are disabled (meaning we're holding down shift for a multiple selection)
  // then start the selection box point
  mouseDown( event ) {
    this.isSpinning = true
    // if it's a double click
    if ( Date.now( ) - this.mouseDownTime < 300 && this.hoveredObject !== null )
      this.zoomToObject( this.hoveredObject )

    if ( this.controls.enabled === false )
      this.selectionBox.startPoint.set( this.mouse.x, this.mouse.y, 0.5 )

    this.mouseDownTime = Date.now( )
  }

  mouseUp( event ) {
    this.isSpinning = false
    // check if it's a single short click (as opposed to a longer difference caused by moving the orbit controls
    // or dragging the selection box)
    if ( Date.now( ) - this.mouseDownTime < 300 ) {
      if ( this.hoveredObject && this.selectedObjects.findIndex( x => x.userData._id === this.hoveredObject.userData._id ) !== -1 ) {
        // Inside the selection -> check if it's a single object deselect
        if ( event.ctrlKey ) {
          this.removeFromSelection( [ this.hoveredObject ] )
          // this.emit( 'select-remove-objects', [ this.hoveredObject.userData._id ] )
          // this.hoveredObject.material.color.copy( this.hoveredObject.material.__preSelectColor )
          // this.hoveredObject.material.__preHoverColor.copy( this.hoveredObject.material.__preSelectColor ) // set the same prehover color as the original color, otherwise on unhover we set the "selected" color back
        }
      } else if ( this.hoveredObject ) { // if there is a hovered object...
        if ( event.shiftKey ) {
          console.log( 'should add to selection' )
          this.addToSelection( [ this.hoveredObject ] )
        } else if ( event.ctrlKey ) {
          console.log( 'should remove from selection' )
          this.removeFromSelection( [ this.hoveredObject ] )
        } else {
          console.log( 'single selection' )
          this.clearSelection( )
          this.addToSelection( [ this.hoveredObject ] )
          // this.hoveredObject.material.__preSelectColor = this.hoveredObject.material.color.clone( )
          // this.hoveredObject.material.__preHoverColor = this.selectColor
          // this.hoveredObject.material.color.copy( this.selectColor )

        }
      } else { // there is no hovered object, so clear selection!?
        this.clearSelection( )
      }
    } else {
      // if the controls were disabled, it means we've been selecting objects with the selection box
      if ( !this.controls.enabled ) {
        this.emit( 'select-objects', this.selectionBox.collection.map( o => o.userData._id ) )
      }
    }
  }

  onTouchMove( event ) {
    let x, y
    if ( event.changedTouches ) {
      x = event.changedTouches[ 0 ].pageX
      y = event.changedTouches[ 0 ].pageY
    } else {
      x = event.clientX
      y = event.clientY
    }
    let rect = this.domObject.getBoundingClientRect( )
    x -= rect.left
    y -= rect.top
    this.mouse.x = ( x / this.domObject.offsetWidth ) * 2 - 1
    this.mouse.y = -( y / this.domObject.offsetHeight ) * 2 + 1

    // disallow interactions on color sets
    if ( this.isSettingColors ) return

    // check if we're dragging a box selection
    if ( this.selectionHelper.isDown && !this.controls.enabled ) {

      this.selectionBox.endPoint.set( this.mouse.x, this.mouse.y, 0.5 );
      var allSelected = this.selectionBox.select( )
      this.addToSelection( allSelected )
      // for ( var i = 0; i < allSelected.length; i++ ) {
      //   allSelected[ i ].material.__preSelectColor = allSelected[ i ].material.color.clone( )
      //   allSelected[ i ].material.color.copy( this.selectColor )
      // }
    }
    // if not, highlight a selected object
    else if ( !this.isSpinning ) {
      this.highlightMouseOverObject( )
    }
  }

  highlightMouseOverObject( ) {
    this.raycaster.setFromCamera( this.mouse, this.camera )
    let intersects = this.raycaster.intersectObjects( [ this.scene ], true )
    if ( intersects.length > 0 ) {
      if ( intersects[ 0 ].object !== this.hoveredObject ) {
        if ( intersects[ 0 ].object.userData.hasOwnProperty( '_id' ) ) {
          this.domObject.style.cursor = 'pointer'
          // if there was a pre-exsiting hovered object
          // unhover it first
          if ( this.hoveredObject ) {
            this.hoveredObject.userData.selected ?
              this.hoveredObject.material.color.copy( this.selectColor ) :
              this.hoveredObject.material.color.copy( this.hoveredObject.material.__preHoverColor )

            this.hoveredObject.userData.hovered = false
          }
          this.hoveredObject = intersects[ 0 ].object
          this.hoveredObject.userData.hovered = true
          this.hoveredObject.material.__preHoverColor = this.hoveredObject.material.color.clone( )
          this.hoveredObject.material.color.copy( this.hoverColor )
        }
      }
    } else {
      this.domObject.style.cursor = 'default'
      if ( this.hoveredObject ) {
        this.hoveredObject.material.color.copy( this.hoveredObject.material.__preHoverColor )
        this.hoveredObject.userData.hovered = false
        this.hoveredObject = null
      }
    }
  }

  addToSelection( objects ) {
    let added = [ ]
    objects.forEach( ( obj, index ) => {
      if ( this.selectedObjects.findIndex( x => x.userData._id === obj.userData._id ) === -1 ) {
        obj.userData.selected = true
        if ( !obj.userData.hovered ) {
          obj.material.__preSelectColor = obj.material.color.clone( )
        } else {
          obj.material.__preSelectColor = obj.material.__preHoverColor.clone( )
          obj.material.__preHoverColor.copy( this.selectColor )
        }

        obj.material.color.copy( this.selectColor )
        this.selectedObjects.push( obj )
        added.push( obj.userData._id )
      }
      if ( index === objects.length - 1 ) {
        // TODO: emit added to selection event
        this.emit( 'select-add-objects', added )
      }
    } )
  }

  removeFromSelection( objects ) {
    let removed = [ ]
    objects.forEach( ( obj, index ) => {
      let myIndex = this.selectedObjects.findIndex( x => x.userData._id === obj.userData._id )
      if ( myIndex !== -1 ) {
        obj.userData.selected = false
        removed.push( obj.userData._id )
        this.selectedObjects.splice( myIndex, 1 )
        obj.material.color.copy( obj.material.__preSelectColor )
        obj.material.__preHoverColor.copy( obj.material.__preSelectColor )
      }
      if ( index === objects.length - 1 ) {
        // TODO: emit removed from selection event
        this.emit( 'select-remove-objects', removed )
      }
    } )
  }

  clearSelection( ) {
    this.selectedObjects.forEach( obj => {
      obj.userData.selected = false
      obj.material.color.copy( obj.material.__preSelectColor )
    } )
    this.emit( 'select-objects', [ ] )
    this.selectedObjects = [ ]
  }

  // adds a bunch of speckle objects to the scene. handles conversion and
  // computes each objects's bounding sphere for faster zoom extents calculation
  // of the scene bounding sphere.
  loadObjects( { objs, zoomExtents } ) {
    objs.forEach( ( obj, index ) => {
      try {
        let splitType = obj.type.split( "/" )
        let convertType = splitType.pop( )
        while ( splitType.length > 0 & !Converter.hasOwnProperty( convertType ) )
          convertType = splitType.pop( )
        if ( Converter.hasOwnProperty( convertType ) )
          Converter[ convertType ]( { obj: obj }, ( err, threeObj ) => {
            threeObj.userData._id = obj._id
            threeObj.userData.properties = obj.properties ? flatten( obj.properties, { safe: true } ) : null
            threeObj.userData.originalColor = threeObj.material.color.clone( )
            threeObj.geometry.computeBoundingSphere( )
            threeObj.castShadow = true
            threeObj.receiveShadow = true
            this.drawEdges( threeObj, obj._id )
            this.scene.add( threeObj )
          } )
      } catch ( e ) {
        console.warn( `Something went wrong in the conversion of ${obj._id} (${obj.type})` )
        console.log( obj )
        console.log( e )
        return
      }

      if ( zoomExtents && ( index === objs.length - 1 ) ) {
        console.log( this.scene.children.length )
        this.computeSceneBoundingSphere( )
        this.zoomExtents( )
      }
    } )
  }

  drawEdges( threeObj, id ) {
    if ( threeObj.type !== 'Mesh' ) return
    var objEdges = new THREE.EdgesGeometry( threeObj.geometry, this.viewerSettings.edgesThreshold )
    var edgeLines = new THREE.LineSegments( objEdges, new THREE.LineBasicMaterial( { color: 0x000000 } ) )
    edgeLines.userData._id = id
    this.edgesGroup.add( edgeLines )
  }

  updateEdges( ) {
    this.processLargeArray( this.edgesGroup.children, ( obj ) => {
      this.edgesGroup.remove( obj )
    } )
    this.processLargeArray( this.scene.children, ( obj ) => {
      if ( obj.type !== 'Mesh' ) return
      this.drawEdges( obj, obj.userData._id )
    } )
  }

  // removes an array of objects from the scene and recalculates the scene bounding sphere
  unloadObjects( { objIds } ) {
    let toRemove = [ ]

    this.scene.traverse( obj => {
      if ( obj.userData._id )
        if ( objIds.indexOf( obj.userData._id ) !== -1 ) toRemove.push( obj )
    } )

    toRemove.forEach( ( object, index ) => {
      object.parent.remove( object )
      if ( index === toRemove.length - 1 ) {
        this.computeSceneBoundingSphere( )
        this.zoomExtents( )
      }
    } )
  }

  // sets (updates) the properties field of the objects
  // (useful if you modify the props outside three)
  updateObjectsProperties( { objects } ) {
    this.processLargeArray( objects, ( obj, index ) => {
      let sceneObject = this.scene.children.find( o => o.userData._id === obj._id )
      if ( !sceneObject ) return
      sceneObject.userData.properties = flatten( obj.properties )
    } )
  }

  // entry point for any attempt to color things by their properties in the viewer
  // depending on the property, it will either call "colorByNumericProperty" or
  // "colorByStringProperty" (see below)
  colorByProperty( { propertyName, propagateLegend, colors } ) {
    console.log( propagateLegend )
    if ( propagateLegend === null || propagateLegend === undefined )
      propagateLegend = true

    let first = this.scene.children.find( o => o.userData && o.userData.properties && o.userData.properties[ propertyName ] )
    if ( !first ) {
      console.warn( `no property found (${propertyName}) on any scene objects.` )
      return
    }
    if ( this.currentColorByProp === propertyName ) return
    this.unHighlightObjects( )
    this.currentColorByProp = propertyName

    let isNumeric = !isNaN( first.userData.properties[ propertyName ] )
    console.log( `coloring by ${propertyName}, which is (numeric: ${isNumeric})` )

    if ( isNumeric ) this.colorByNumericProperty( { propertyName: propertyName, propagateLegend: propagateLegend, colors } )
    else this.colorByStringProperty( { propertyName: propertyName, propagateLegend: propagateLegend } )
  }

  // attempts to color all objects  in the scene by a numeric property, computing its bounds
  // and generating a gradient from min (blue) to max (pinkish)
  colorByNumericProperty( { propertyName, propagateLegend, colors } ) {
    if ( propagateLegend === null || propagateLegend === undefined )
      propagateLegend = true
    // compute bounds
    let min = 10e6,
      max = -10e6,
      foundObjs = [ ],
      toReset = [ ]

    this.isSettingColors = true
    // TODO: chunkify this loop yo
    for ( let obj of this.scene.children ) {
      if ( !( obj.userData && obj.userData.properties && obj.userData.properties[ propertyName ] ) ) {
        toReset.push( obj )
        continue
      }
      if ( !obj.visible ) continue

      let value = obj.userData.properties[ propertyName ]
      if ( value > max ) max = value
      if ( value < min ) min = value
      foundObjs.push( obj )
    }

    if ( min === max ) {
      min -= 1
      max += 1
    }

    console.log( `bounds: ${min}, ${max} 🌈` )
    if ( propagateLegend )
      this.emit( 'analysis-legend', { propertyName: propertyName, isNumeric: true, min: min, max: max, objectCount: foundObjs.length } )
    // gen rainbow 🌈
    let rainbow = new Rainbow( )
    rainbow.setNumberRange( min, max )
    rainbow.setSpectrum( ...colors )

    foundObjs.forEach( ( obj, index ) => {
      let value = obj.userData.properties[ propertyName ],
        color = null

      if ( !isNaN( value ) && !!value )
        color = new THREE.Color( `#${rainbow.colourAt( value )}` )
      else
        color = new THREE.Color( '#B3B3B3' )

      if ( !obj.userData.selected ) {
        obj.material._oldColor = obj.material.color
        obj.material.color.copy( color )
      } else {
        obj.material.__preSelectColor.copy( color )
      }

      if ( index === foundObjs.length - 1 ) {
        this.isSettingColors = false
      }
    } )

    let defaultColor = new THREE.Color( '#B3B3B3' )
    toReset.forEach( obj => {
      // if ( !obj.userData.selected ) {
      //   obj.material._oldColor = obj.material.color
      if ( obj.material )
        obj.material.color.copy( defaultColor )
      // } else {
      //   obj.material.__preSelectColor.copy( color )
      // }
    } )
  }

  // attempts to color all objects in the scene by a string property
  // uses colorHasher to get a hex color out of a string
  colorByStringProperty( { propertyName, propagateLegend } ) {
    if ( propagateLegend === null || propagateLegend === undefined )
      propagateLegend = true
    let toReset = [ ],
      foundCount = 0

    this.isSettingColors = true
    // TODO: chunkify this loop yo
    this.processLargeArray( this.scene.children, ( obj, index ) => {
      if ( !( obj.userData && obj.userData.properties && obj.userData.properties[ propertyName ] ) ) {
        toReset.push( obj )
        return
      }
      let value = obj.userData.properties[ propertyName ]
      let color = null
      if ( !this.colorTable.hasOwnProperty( value.toString( ) ) ) {
        if ( value.toString( ) === 'no material' ) {
          this.colorTable[ value.toString( ) ] = new THREE.Color( '#B3B3B3' )
        } else {
          this.colorTable[ value.toString( ) ] = new THREE.Color( this.colorHasher.hex( value.toString( ) ) )
        }
      }
      color = this.colorTable[ value.toString( ) ]

      if ( !obj.userData.selected ) {
        obj.material._oldColor = obj.material.color
        obj.material.color.copy( color )
      } else {
        obj.material.__preSelectColor.copy( color )
      }

      foundCount++
      if ( index === this.scene.children.length - 1 ) {
        this.isSettingColors = false
        if ( propagateLegend )
          this.emit( 'analysis-legend', { propertyName: propertyName, isNumeric: false, objectCount: foundCount } )
      }
    }, 5000 )

    let defaultColor = new THREE.Color( '#B3B3B3' )
    toReset.forEach( obj => {
      if ( obj.material )
        obj.material.color.copy( defaultColor )
    } )
  }

  colorByVertexArray( { propertyName, colors } ) {
    let globalMin = Number.MAX_VALUE,
      globalMax = -Number.MIN_VALUE,
      toReset = [ ],
      toColour = [ ]

    for ( let obj of this.scene.children ) {
      if ( !( obj.userData && obj.userData.properties && obj.userData.properties[ `structural.result.${propertyName}` ] ) ) {
        toReset.push( obj )
        continue
      }
      let min = Math.min( ...obj.userData.properties[ `structural.result.${propertyName}` ] )
      let max = Math.max( ...obj.userData.properties[ `structural.result.${propertyName}` ] )
      if ( min < globalMin ) globalMin = min
      if ( max > globalMax ) globalMax = max
      toColour.push( obj )
    }

    console.log( `👨‍🎨 ::: prop: ${propertyName} ::: min: ${globalMin}; max: ${globalMax}; objs: ${toColour.length}` )

    let rainbow = new Rainbow( )
    rainbow.setNumberRange( globalMin, globalMax )
    rainbow.setSpectrum( ...colors )

    for ( let obj of toColour ) {
      let colors = new Uint8Array( obj.userData.properties[ `structural.result.${propertyName}` ].length * 3 ),
        k = 0

      for ( let val of obj.userData.properties[ `structural.result.${propertyName}` ] ) {
        let myColour = hexToRgb( rainbow.colourAt( val ) )
        colors[ k++ ] = myColour.r
        colors[ k++ ] = myColour.g
        colors[ k++ ] = myColour.b
      }
      obj.geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3, true ) )
      obj.geometry.attributes.color.needsUpdate = true
      obj.geometry.colorsNeedUpdate = true
      obj.material.vertexColors = THREE.VertexColors
      this.setMaterialOverrides( obj )
    }
    this.emit( 'analysis-legend', { propertyName: propertyName, isNumeric: false, min: globalMin, max: globalMax, objectCount: toColour.length } )
  }

  resetColors( { propagateLegend } ) {
    if ( propagateLegend === null || propagateLegend === undefined )
      propagateLegend = true

    let defaultColor = new THREE.Color( '#B3B3B3' )

    for ( let obj of this.scene.children ) {
      if ( obj.material ) {
        this.setMaterialOverrides( obj )
        obj.material.vertexColors = THREE.NoColors
        obj.material.needsUpdate = true
      }
      if ( obj.material ) obj.material.color.copy( defaultColor )
      continue
      if ( !obj.material ) continue
      if ( !( obj.material._oldColor ) ) {
        obj.material.color.copy( defaultColor )
        continue
      }

      obj.material.color.copy( obj.material._oldColor )
    }
    this.currentColorByProp = null
    if ( propagateLegend ) this.emit( 'clear-analysis-legend' )
  }

  // TODO
  ghostObjects( objIds ) {}
  unGhostObjects( objIds ) {}

  // TODO
  showObjects( objIds ) {
    if ( objIds.length !== 0 )
      this.scene.traverse( obj => {
        if ( objIds.indexOf( obj.userData._id ) !== -1 ) {
          if ( obj.name !== null ) {
            if ( obj.name == 'displayEdgesGroup' ) return
          }
          obj.visible = true
        }
      } )
    else
      this.scene.traverse( obj => {
        if ( obj.name !== null ) {
          if ( obj.name == 'displayEdgesGroup' ) return
        }
        obj.visible = true
      } )
  }

  hideObjects( objIds ) {
    if ( objIds.length !== 0 )
      this.scene.traverse( obj => {
        if ( objIds.indexOf( obj.userData._id ) !== -1 )
          obj.visible = false
      } )
    else
      this.scene.traverse( obj => obj.visible = false )
  }
  // leaves only the provided objIds visible
  isolateObjects( objIds ) {
    this.scene.children.forEach( obj => {
      if ( !obj.userData._id ) return
      if ( objIds.includes( obj.userData._id ) ) obj.visible = true
      else obj.visible = false
    } )
  }


  highlightObjects( objIds ) {
    return // TODO: performance sucks for large object groups
    if ( this.isSettingColors ) return
    this.highlightedObjects = objIds
    let objs = this.scene.children.filter( o => objIds.includes( o.userData._id ) )
    objs.forEach( obj => {
      obj.userData.hovered = true
      obj.material.__preHoverColor = obj.material.color.clone( )
      obj.material.color.copy( this.hoverColor )
    } )
  }
  unHighlightObjects( objIds ) {
    return // TODO: performance sucks for large object groups
    if ( !objIds )
      objIds = this.highlightedObjects

    let objs = this.scene.children.filter( o => objIds.includes( o.userData._id ) )
    objs.forEach( obj => {
      obj.material.color.copy( obj.material.__preHoverColor )
      obj.userData.hovered = false
      obj = null
    } )
    this.highlightedObjects = [ ]
  }

  zoomToObject( obj ) {
    if ( typeof obj === 'string' ) {
      obj = this.scene.children.find( o => o.userData._id === obj )
    }
    if ( !obj ) return
    let bsphere = obj.geometry.boundingSphere
    if ( bsphere.radius < 1 ) bsphere.radius = 2
    // let r = bsphere.radius

    let offset = bsphere.radius / Math.tan( Math.PI / 180.0 * this.controls.object.fov * 0.5 )
    let vector = new THREE.Vector3( 0, 0, 1 )
    let dir = vector.applyQuaternion( this.controls.object.quaternion );
    let newPos = new THREE.Vector3( )
    dir.multiplyScalar( offset * 1.5 )
    newPos.addVectors( bsphere.center, dir )
    this.setCamera( {
      position: [ newPos.x, newPos.y, newPos.z ],
      rotation: [ this.camera.rotation.x, this.camera.rotation.y, this.camera.rotation.z ],
      target: [ bsphere.center.x, bsphere.center.y, bsphere.center.z ]
    }, 600 )
  }

  zoomExtents( ) {
    this.computeSceneBoundingSphere( )
    let offset = this.sceneBoundingSphere.radius / Math.tan( Math.PI / 180.0 * this.controls.object.fov * 0.5 )
    let vector = new THREE.Vector3( 0, 0, 1 )
    let dir = vector.applyQuaternion( this.controls.object.quaternion );
    let newPos = new THREE.Vector3( )
    dir.multiplyScalar( offset * 1.25 )
    newPos.addVectors( this.sceneBoundingSphere.center, dir )
    this.setCamera( {
      position: [ newPos.x, newPos.y, newPos.z ],
      rotation: [ this.camera.rotation.x, this.camera.rotation.y, this.camera.rotation.z ],
      target: [ this.sceneBoundingSphere.center.x, this.sceneBoundingSphere.center.y, this.sceneBoundingSphere.center.z ]
    }, 450 )
  }

  computeSceneBoundingSphere( ) {
    let center = null,
      radius = 0,
      k = 0

    for ( let obj of this.scene.children ) {
      if ( !obj.userData._id ) continue
      if ( !obj.geometry ) continue

      if ( k === 0 ) {
        center = new THREE.Vector3( obj.geometry.boundingSphere.center.x, obj.geometry.boundingSphere.center.y, obj.geometry.boundingSphere.center.z )
        radius = obj.geometry.boundingSphere.radius
        k++
        continue
      }

      let otherDist = obj.geometry.boundingSphere.radius + center.distanceTo( obj.geometry.boundingSphere.center )
      if ( radius < otherDist )
        radius = otherDist

      center.x += obj.geometry.boundingSphere.center.x
      center.y += obj.geometry.boundingSphere.center.y
      center.z += obj.geometry.boundingSphere.center.z
      center.divideScalar( 2 )

      k++
    }

    if ( !center ) {
      center = new THREE.Vector3( 0, 0, 0 )
    }

    this.sceneBoundingSphere = { center: center ? center : new THREE.Vector3( ), radius: radius > 1 ? radius * 1.1 : 100 }
  }

  setFar( ) {
    let camDistance = this.camera.position.distanceTo( this.sceneBoundingSphere.center )
    this.camera.far = 3 * this.sceneBoundingSphere.radius + camDistance * 3 // 3 is lucky
    this.camera.updateProjectionMatrix( )
  }

  setCamera( where, time ) {
    let self = this
    let duration = time ? time : 350
    //position
    new TWEEN.Tween( self.camera.position ).to( { x: where.position[ 0 ], y: where.position[ 1 ], z: where.position[ 2 ] }, duration ).easing( TWEEN.Easing.Quadratic.InOut ).start( )
    // rotation
    new TWEEN.Tween( self.camera.rotation ).to( { x: where.rotation[ 0 ], y: where.rotation[ 1 ], z: where.rotation[ 2 ] }, duration ).easing( TWEEN.Easing.Quadratic.InOut ).start( )
    // controls center
    new TWEEN.Tween( self.controls.target ).to( { x: where.target[ 0 ], y: where.target[ 1 ], z: where.target[ 2 ] }, duration ).onUpdate( ( ) => {
      self.controls.update( );
      if ( this.x === where.target[ 0 ] )
        console.log( 'camera finished stuff' )
    } ).easing( TWEEN.Easing.Quadratic.InOut ).start( )
  }

  //Generic helpers
  processLargeArray( array, fn, chunk, context ) {
    context = context || window
    chunk = chunk || 500 // 100 elems at a time
    let index = 0

    function doChunk( ) {
      let count = chunk
      while ( count-- && index < array.length ) {
        fn.call( context, array[ index ], index, array )
          ++index
      }
      if ( index < array.length )
        setTimeout( doChunk, 1 )
    }
    doChunk( )
  }

  processLargeArrayAsync( array, fn, maxTimePerChunk, context ) {
    context = context || window
    maxTimePerChunk = maxTimePerChunk || 200
    let index = 0

    function doChunk( ) {
      let startTime = Date.now( )
      while ( index < array.length && ( Date.now( ) - startTime ) <= maxTimePerChunk ) {
        // callback called with args (value, index, array)
        fn.call( context, array[ index ], index, array )
          ++index
      }
      if ( index < array.length ) setTimeout( doChunk, 1 )
    }
    doChunk( )
  }

  updateViewerSettings( ) {
    this.setDefaultMeshMaterial( )
    this.updateMaterialManager( )
    this.shadowLight.visible = this.viewerSettings.castShadows
    this.edgesGroup.visible = this.viewerSettings.showEdges
    if ( this.edgesThreshold != this.viewerSettings.edgesThreshold ) {
      this.updateEdges( )
    }
    this.edgesThreshold = this.viewerSettings.edgesThreshold
  }

  setDefaultMeshMaterial( ) {
    for ( let obj of this.scene.children ) {
      if ( obj.type === 'Mesh' ) {
        if ( obj.material ) {
          this.setMaterialOverrides( obj )
        }
      }
    }
  }

  setMaterialOverrides( obj ) {
    obj.material.opacity = this.viewerSettings.meshOverrides.opacity / 100
    let specColor = new THREE.Color( )
    specColor.setHSL( 0, 0, this.viewerSettings.meshOverrides.specular / 100 )
    obj.material.specular = specColor
    obj.material.needsUpdate = true
  }

  updateMaterialManager( ) {
    let specColor = new THREE.Color( )
    specColor.setHSL( 0, 0, this.viewerSettings.meshOverrides.specular / 100 )
    Converter.materialManager.defaultMeshMat.specular = specColor
    Converter.materialManager.defaultMeshMat.opacity = this.viewerSettings.meshOverrides.opacity / 100
  }
}


// Helper
function hexToRgb( hex ) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace( shorthandRegex, function ( m, r, g, b ) {
    return r + r + g + g + b + b;
  } );

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec( hex );
  return result ? {
    r: parseInt( result[ 1 ], 16 ),
    g: parseInt( result[ 2 ], 16 ),
    b: parseInt( result[ 3 ], 16 )
  } : null;
}
