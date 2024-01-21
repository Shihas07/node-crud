
const http = require("http");
const fs = require("fs");
const querystring = require("querystring");
const { v4: uuidv4 } = require("uuid");

const html = fs.readFileSync("./index.html", "utf-8");
const home = fs.readFileSync("./home.html", "utf-8");
const updatefile=fs.readFileSync("./update.html","utf-8")
const temp=fs.readFileSync("./temp.html","utf-8")
const jsonFilePath = "./data.json";
const url = require('url');


let jsonData = [];


try {
  const data = fs.readFileSync(jsonFilePath, "utf-8");
  jsonData = JSON.parse(data);
} catch (error) {
  console.error(`Error reading/parsing JSON file: ${error.message}`);
}


const tableRows = jsonData.map((item) => {
  let output = `<tr>
  <td>${item.name}</td>
  <td>${item.age}</td>
  <td>${item.email}</td>
  <td>${item.phone}</td>

  <td>
    <form action="/edit" method="post">
     <input type="hidden" name="id" value="${item.id}"> 
      <input class="btn btn-primary btn-lg" type="submit" value="Edit">
    </form>
  </td>
  <td>
  <form action="/delete" method="post">
     <input type="hidden" name="id" value="${item.id}">
     <input class="btn btn-danger" type="submit" value="delete">
  </form>
</td>

</tr>`;
  return output;
}).join("");


const server = http.createServer((req, res) => {
  if (req.url === "/") {
  
    const homePageWithTable = home.replace("{{%tableBody}}", tableRows);
    res.end(homePageWithTable);
  } else if (req.url==="/home"){
    const homePageWithTable = home.replace("{{%tableBody}}", tableRows);
    res.end(homePageWithTable);
  }
  else if (req.method.toUpperCase() === "GET") {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const pathname = parsedUrl.pathname;
        
    if (pathname === "/formpage") {
      res.end(html);
    }
  } else if (req.method === "POST" && req.url === "/submit") {

    let formData = "";

    req.on("data", (chunk) => {
        formData += chunk.toString();
    });

    req.on("end", () => {
        const parsedData = querystring.parse(formData);
        parsedData.id = uuidv4();

        fs.readFile(jsonFilePath, "utf-8", (readError, data) => {
            if (readError) {
                console.error(`Error reading JSON file: ${readError}`);
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Internal Server Error");
                return;
            }

            let existingData = [];

            try {
                existingData = JSON.parse(data);
            } catch (parseError) {
                console.error(`Error parsing JSON file: ${parseError}`);
            }

            existingData.push(parsedData);

            fs.writeFile(jsonFilePath, JSON.stringify(existingData, null, 2), "utf-8", (writeError) => {
                if (writeError) {
                    console.error(`Error writing to JSON file: ${writeError}`);
                    res.writeHead(500, { "Content-Type": "text/plain" });
                    res.end("Internal Server Error");
                } else {
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.end(html);
                }
            });
        });
    });
}
      

     else if (req.url === "/edit" && req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
    
      req.on("end", () => {
        const formData = querystring.parse(body);
        console.log(formData);
    
        
        const inputId = formData.id;
    
        
        let editValueIndex = jsonData.find((item) => {
          console.log(item.id === inputId)
          return item.id === inputId
        });
          console.log(inputId)
        // console.log(editValueIndex);
    
        if (editValueIndex) {
          
    
          fs.writeFile(
            jsonFilePath, JSON.stringify(jsonData, null, 2),(err) => {
              if (err) {
                console.error("Error writing to file:", err.message);
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Internal Server Error" }));
              } else {
                
                const editedFormWithData = updatefile
  .replace("{{%name%}}", editValueIndex.name)
  .replace("{{%age%}}", editValueIndex.age)
  .replace("{{%phone%}}", editValueIndex.phone)
  .replace("{{%email%}}", editValueIndex.email)
  .replace("{{%id%}}", editValueIndex.id)
  console.log(editValueIndex.age)

res.writeHead(200, { "Content-Type": "text-plain" });
res.end(editedFormWithData);
              }
            }
          );
        } else {
          res.writeHead(404, { "Content-Type": "text-plain" });
          res.end(JSON.stringify({ error: "Entry not found" }));
        }
      });
    }
    





else if (req.url === "/editSubmit" && req.method === "POST") {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
  });

  req.on("end", () => {
    const formData = querystring.parse(body);
    const inputId = formData.id;
    console.log(formData)

    
    let editValueIndex = jsonData.findIndex((item) => item.id === inputId);

    if (editValueIndex !== -1) {
      
      jsonData[editValueIndex].name = formData.name;
      jsonData[editValueIndex].age = formData.age;
      jsonData[editValueIndex].phone = formData.phone;
      jsonData[editValueIndex].email = formData.email;
console.log(formData.name);

      
      fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2), (err) => {
        if (err) {
          console.error("Error writing to file:", err.message);
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Internal Server Error" }));
        } else {
          res.writeHead(302, { Location: "/home" });
          res.end();
        }
      });
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Entry not found" }));
    }
  });
}


else if (req.url === "/delete" && req.method === "POST") {
  let body = "";
  req.on("data", (chunk) => {
     body += chunk;
  });

  req.on("end", () => {
     const formData = querystring.parse(body);
     const inputId = formData.id;
     console.log(inputId);
     console.log(formData.id);

     let deleteIndex = jsonData.findIndex((item) => item.id === inputId);
          console.log(deleteIndex);
         
     if (deleteIndex !== -1) {
        jsonData.splice(deleteIndex, 1);
        fs.writeFile(jsonFilePath, JSON.stringify(jsonData, null, 2), (err) => {
           if (err) {
              console.error("Error writing to file:", err.message);
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ error: "Internal Server Error" }));
           } else {
              res.writeHead(302, { Location: "/home" });
              res.end(home);
           }
        //     } else {
        //     // Send a response with JavaScript to reload the page
        //     console.log("Page reload script executed");
        //     const script = '<script>window.location.reload();</script>';
        //     res.writeHead(200, { "Content-Type": "text/html" });
        //     res.end(script);
        //  }
        });
      
     } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Entry not found" }));
     }
  });
}



else {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write(`<script>updateTable();</script>User added successfully`);
  res.end();
}

});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server has started on http://localhost:${PORT}/`);
});





