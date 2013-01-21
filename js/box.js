function box(divId,numOfOutputs,hasInput,title,contents) {
		this.divId = divId;
		this.numOfOutputs = numOfOutputs;
		this.hasInput = hasInput;
		this.x = 10;
		this.y = 10;
		
		this.title = title;
		this.contents = contents;
		
}


function vfpCanvas(connAddedFunc,connRemoveFunc) {

	var boxes = [];
	this.boxes = boxes;

    var boxObjs = {};
    this.boxObjs = boxObjs;

    var connections = []; //[["box1","box2"], ["box1","box3"], ["box4","box1"] ];
	this.connections = connections;
	
	var lastUpdate = 0;
	var curDragingAreaParentId = "";
	var curDragingAreaId = ""; 
	var gridSize = 20;
	var canvasHolderDivId = "vfp_root";
	var updateSpeed = 20;

	var draggableOptions = {
		start: function() {
		    
		},
		
		drag: function() { 
			redrawConnections();
			
			var pos = $(this).position();
			boxObjs[$(this).attr("id")].x = pos.left;
			boxObjs[$(this).attr("id")].y = pos.top;
			
		},
		stop:  redrawConnectionsNow,
		
		handle: "p.ui-widget-header",	
		
		grid: [ gridSize,gridSize ],
		cursor: "move",
		
		containment: "#myCanvas", scroll: false
	};


		
	var startAreaDraggableOprions = {
		helper: "clone",
		cursor: "move",
		cursorAt: { left: 12, top: 12 },
		start: function() {
			curDragingAreaParentId = $( this ).parent().attr("id");
			curDragingAreaId = $( this ).attr("id");
		},
		drag: redrawConnections,
		stop: function() {
			curDragingAreaParentId = "";
			curDragingAreaId = "";
			redrawConnectionsNow();
		}


	};
		

		
	var endAreaDroppableOptions = {
	
		accept: ".startArea",
		activeClass: "endArea-active",
		hoverClass: "endArea-hover",
		drop: function( event, ui ) {
			//$( this )
				//.addClass( "ui-state-highlight" )
			   // .find( "p" )
				//    .html( "Dropped!" );

			//alert( curDragingAreaId + "  " + $( this ).attr("id"));
			addConnection(curDragingAreaId,$( this ).attr("id"), connAddedFunc,connRemoveFunc);
			curDragingAreaParentId = "";
			curDragingAreaId = "";
			redrawConnectionsNow();
		}
	};

	
	
	function addBox(box) {
		createBoxElement(box);
		boxes.push(box.divId);
		initDraggableBox(box.divId);
		
		boxObjs[box.divId] = box;
	}
	this.addBox = addBox;
	
	function addNewBox(boxId,numOfOuts,hasInput,title, contents) {
    	var boxEl = new box(boxId, numOfOuts,hasInput,title,contents);
		createBoxElement(boxEl);
		boxes.push(boxId);
		initDraggableBox(boxId);
		
		boxObjs[boxId] = boxEl;
    }
	this.addNewBox = addNewBox;


	function addConnection(start,end,actionAdd, actionRemove) {
	
		for (conn in connections	) {
			var connList= connections[conn];

			//get start and end Id
			var startId  = connList[0];
			var endId  = connList[1];
		
			if (startId == start && endId == end) {
				return false;
			}
			
		}
	
	
		if (actionAdd(start,end)) {
	
	
			var newConn = [];
			newConn.push(start);
			newConn.push(end);
			connections.push( newConn );
		
			$("#"+canvasHolderDivId).append('<div id="'+start+'-'+end+'" class="connectionAncor"></div>');
			$("#"+start+"-"+end).click(function() {
				removeConnection(start, end,actionRemove);
			
			});
	
		}
	
	
	
	}
	this.addConnection = addConnection;



	function removeConnectionAnchor(start,end) {
		$("#"+start+"-"+end).remove();
	}
	this.removeConnectionAnchor = removeConnectionAnchor;


	function removeConnection(start, end, actionRemove) {
		for (conn in connections	) {
			var connList= connections[conn];

			//get start and end Id
			var startId  = connList[0];
			var endId  = connList[1];
		
			if (startId == start && endId == end) {
				if (actionRemove(start,end)) {
					connections.splice(conn,1);
					removeConnectionAnchor(startId,endId);
					break;
				}
			}
		
		}
	
		redrawConnectionsNow();
	}
	this.removeConnection = removeConnection;


	function removeConnections(end) {
	
		for (conn in connections	) {
			var connList= connections[conn];

			//get start and end Id
			var startId  = connList[0];
			var endId  = connList[1];
		
			if (endId == end) {
				connections.splice(conn,1);
				removeConnectionAnchor(startId,endId);
				removeConnections(end);
				break;
			}
		
		}
	
	}
	this.removeConnections = removeConnections;

	function initDraggableBoxes() {

		for (boxI in boxes) {
			var boxId = boxes[boxI];
			initDraggableBox(boxId);
		}
	
	
		drawGrid();
		redrawConnections();
	}
	
	this.initDraggableBoxes = initDraggableBoxes;
	

	function initDraggableBox(boxId) {
		$( "#"+boxId ).draggable(draggableOptions);
		$( "#"+boxId +" > .startArea" ).draggable(startAreaDraggableOprions);
		$( "#"+boxId +" > .endArea" ).droppable(endAreaDroppableOptions);
	

	}
	this.initDraggableBox = initDraggableBox;

	function redrawConnectionsNow() {
		lastUpdate = 0;
		redrawConnections();
	}
	this.redrawConnectionsNow = redrawConnectionsNow;


	function drawGrid() {
	
		var c=document.getElementById("myCanvasGrid");
		var ctx=c.getContext("2d");
	
		for (var i=10; i<c.width; i= i + gridSize) {
			for (var j=10; j<c.height; j= j+ gridSize) {
		
				ctx.fillStyle = "rgba(40, 40, 40, 0.1)";
				ctx.fillRect (i, j, 2, 2);
			}
		}
	}
	this.drawGrid = drawGrid;

	function redrawConnections() {
		var d = new Date();
		var n = d.getTime(); 
	

		if (n - lastUpdate >= updateSpeed)
		{
			lastUpdate = n;

			//create context
			var c=document.getElementById("myCanvas");
			var ctx=c.getContext("2d");

			//clear canvas
			c.width = c.width;
		
			//draw grid
			//drawGrid(c,ctx);


			for (conn in connections	)
			{
				var connList= connections[conn];

				//get start and end Id
				var startId  = connList[0];
				var endId  = connList[1];

				//get start end end positions
				var startPos = $("#"+startId).position();
				var endPos = $("#"+endId).position();
			
				var startParentPos = $("#"+startId).parent().position();
				var endParentPos = $("#"+endId).parent().position();
			

				var startX = startPos.left + startParentPos.left + $("#"+startId).width(); // - 10;
				var startY = startPos.top + startParentPos.top +  ($("#"+startId).height() / 2);

				var endX = endPos.left + endParentPos.left - $("#"+endId).width();;
				var endY = endPos.top + endParentPos.top + ($("#"+endId).height() / 2) ;


				var distance = Math.sqrt( (endX - startX)*(endX - startX) +  (endY - startY)*(endY - startY) );
			
			
				var centerPointX = startX + (endX - startX)/2;
				var centerPointY = startY + (endY - startY)/2;
				//var centerPointX2 = startX + (endX - startX)/3*2 -(distance/4);
				//var centerPointY2 = startY + (endY - startY)/3*2 - (distance/4);
			
				var centerPointX1 = startX + (distance/3);
				var centerPointY1 = startY;
				var centerPointX2 = endX  -(distance/3);
				var centerPointY2 = endY;
			
			

				//draw line
				ctx.beginPath();
				ctx.moveTo(startX,startY);
				//ctx.lineTo(endX,endY);
				ctx.bezierCurveTo(centerPointX1 ,centerPointY1,centerPointX2 ,centerPointY2,  endX,endY);
				ctx.lineWidth = 3;
				ctx.strokeStyle = '#aaa';
				ctx.stroke();

			
				//move anchor point
				///console.log(centerPointY + " "+centerPointX );
				//$("#"+startId+"-"+endId).offset({top: centerPointY -4 , left: centerPointX -4});
				$("#"+startId+"-"+endId).css({left:centerPointX,top:centerPointY});
				//alert("#"+startId+"-"+endId  +"  -  " + $("#"+startId+"-"+endId).attr("id"));
			
			}
		
		
			if (curDragingAreaId != "") {
			
				var startId = curDragingAreaId;
			
				var startPos = $("#"+startId).position();
				var endPos = $('.ui-draggable-dragging').position();
			
				var startParentPos = $("#"+startId).parent().position();

			
				var startX = startPos.left + startParentPos.left + $("#"+startId).width(); // - 10;
				var startY = startPos.top + startParentPos.top +  ($("#"+startId).height() / 2);

			
			
				var endX = endPos.left +startParentPos.left  + $("#"+startId).width(); 
				var endY = endPos.top +startParentPos.top +  ($("#"+startId).height() / 2);
			
				ctx.beginPath();
				ctx.moveTo(startX,startY);
				ctx.lineTo(endX,endY);
				//ctx.bezierCurveTo(centerPointX1 ,centerPointY1,centerPointX2 ,centerPointY2,  endX,endY);
				ctx.lineWidth = 3;
				ctx.strokeStyle = '#caa';
				ctx.stroke();
			}
		
		
			/*


			var p = $("#draggable");
			var position = p.position();

			var c=document.getElementById("myCanvas");
			var ctx=c.getContext("2d");
			c.width = c.width;


			ctx.fillStyle="#FF0000";
			ctx.fillRect(startLocation.left,startLocation.top,
			 position.left - startLocation.left,
			 position.top - startLocation.top
			);


			ctx.beginPath();
			//ctx.moveTo(startLocation.left,startLocation.top);
			ctx.lineTo(position.left,position.top);
			ctx.stroke();

			*/
			//$("#lastUpdate").html(n);

		}

		//$("#update").html(n);	
	}
	this.redrawConnections = redrawConnections;
	
	function createBoxElement(box) {
		$("#"+canvasHolderDivId).append('<div id="'+box.divId+'" class="box"></div>');

		$("#"+box.divId).append('<p id="'+box.divId+'-title" class="ui-widget-header">'+box.title+'</p>');

		if (box.hasInput) {
			$("#"+box.divId).append('<div id="'+box.divId+'-end0" class="endArea"></div>');
			$("#"+box.divId).append('<div id="'+box.divId+'-end0-name" class="endAreaText"></div>');
		}

		if(box.numOfOutputs == 1) {
			$("#"+box.divId).append('<div id="'+box.divId+'-start0" class="startArea"></div>');
			$("#"+box.divId).append('<div id="'+box.divId+'-start0-name" class="startAreaText"></div>');
		}
		else if (box.numOfOutputs > 1) {
			for (var i=1; i<=box.numOfOutputs; i++) {
				$("#"+box.divId).append('<div id="'+box.divId+'-start'+(i-1)+'" class="startArea startArea'+i+'-'+box.numOfOutputs+'"></div>');
				$("#"+box.divId).append('<div id="'+box.divId+'-start'+(i-1)+'-name" class="startAreaText'+i+'-'+box.numOfOutputs+'"></div>');
			}
		}
		
		
		$("#"+box.divId).append('<div id="'+box.divId+'-contents" >'+box.contents+'</div>');
		
		
		$("#"+box.divId).css({left: box.x, top: box.y});


		/*
		<div id="box2" class="ui-widget-content box"><p class="ui-widget-header">handle</p>	
		<p>Drag me around</p>

		<div  id="box2-start0" class="startArea"></div>
		<div id="box2-end0" class="endArea"></div>
		</div>
		*/
	}
	
	this.createBoxElement = createBoxElement;
	
}