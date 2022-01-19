const assignNewIdentity = async function() {
  const Identity = new WebClient.Identity();
  const identity = Identity.getIdentity();
  window.localStorage.setItem("identity",JSON.stringify(identity));
  window.identity = identity;
}

const didComm = async function(jwt,to,schema) {
  window.editorIn.set({});
  let resolver = new WebClient.JWTResolver();
  let payload = {
    did:jwt
  }
  if((typeof to !== 'undefined') && (to !== null)) payload.to = to;
  if((typeof schema !== 'undefined') && (schema !== null)) payload.schema = schema;

  $.ajax({
  type: "POST",
  url: "/api/jwt/input",
  data:payload,
  success: async function(result) {
      let json = WebClient.JWTDecode(result);
      window.editorIn.set(json.payload);
      $('.extEdit').hide();
      if(typeof json.payload.iss !== 'undefined') {
          $('#cloudId').html(json.payload.iss.substr(9));
      }
    }
  });
}

const ping = function() {
  return new Promise(async function(resolve,reject) {
      let builder = new WebClient.JWTBuilder({identity:window.identity});
      let payload = { "type": "CONTRL","ping": new Date().getTime() };
      window.editorOut.set(payload);
      didComm(await builder.toJWT(payload));
      resolve();
  });
}

const schemas = function() {
  return new Promise(async function(resolve,reject) {
      let builder = new WebClient.JWTBuilder({identity:window.identity});
      let payload = { "type": "CONTRL","listSchemas": true };
      window.editorOut.set(payload);
      didComm(await builder.toJWT(payload));
      resolve();
  });
}

const presentations = function() {
  return new Promise(async function(resolve,reject) {
      let builder = new WebClient.JWTBuilder({identity:window.identity});
      let payload = { "type": "CONTRL","listPresentations": true };
      window.editorOut.set(payload);
      didComm(await builder.toJWT(payload));
      resolve();
  });
}

const addSchema = function() {
  $.getJSON("./test.schema.apple.json",function(data) {
    $('#skeletonTitle').html('edit schema before submission');
    window.editorFiller.set(data);
    $('#btnApplySend').attr('data-apply','schema');
    location.href='#editorFiller';
  });
}

const addPresentation = function() {
    $('.extEdit').show();
  $.getJSON("./test.apple.json",function(data) {
    $('#skeletonTitle').html('edit presentation');
    window.editorFiller.set(data);
    $('#btnApplySend').attr('data-apply','presentation');
    location.href='#editorFiller';
  });
}
const applySend = function() {
  return new Promise(async function(resolve,reject) {
     if($('#btnApplySend').attr('data-apply') == 'schema') {
       let builder = new WebClient.JWTBuilder({identity:window.identity});
       let payload = { "type": "CONTRL","addSchema": window.editorFiller.get() };
       window.editorOut.set(payload);
       didComm(await builder.toJWT(payload));
     }
     if($('#btnApplySend').attr('data-apply') == 'presentation') {
       let builder = new WebClient.JWTBuilder({identity:window.identity});
       let payload = window.editorFiller.get();
       window.editorOut.set(payload);
       didComm(await builder.toJWT(payload),$('#presentTo').val(),$('#presentSchema').val());
     }
     resolve();
   });
}
$(document).ready(async function() {
  const containerFiller = document.getElementById("editorFiller")
  const containerOut = document.getElementById("editorOut")
  const containerIn = document.getElementById("editorIn")

  const options = {}
  window.editorFiller = new JSONEditor(containerFiller, options);
  window.editorOut = new JSONEditor(containerOut, options);
  window.editorIn = new JSONEditor(containerIn, options);


  window.identity = window.localStorage.getItem("identity");
  if((typeof window.identity == 'undefined') || (window.identity == null)) {
    assignNewIdentity();
  } else {
    try {
      window.identity = JSON.parse(window.identity);
    } catch(e) {
      assignNewIdentity();
    }
  }
  $('#browserId').html(window.identity.identifier);
  $('#btnPing').click(ping);
  $('#btnPresentations').click(presentations);
  $('#btnSchemas').click(schemas);
  $('#btnAddSchema').click(addSchema);
  $('#btnAddPresentation').click(addPresentation);
  $('#btnApplySend').click(applySend);
})
