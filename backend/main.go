package main

import (
	"log"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
    "github.com/gin-contrib/static"
	"bank-fraud-demo/api"
	"bank-fraud-demo/services"
	"net/http/httputil"
	"net/url"
    "bank-fraud-demo/db"
)

func main() {
	// Configuration (Env vars or defaults)
	neo4jUri := strings.TrimSpace(os.Getenv("NEO4J_URI"))
	if neo4jUri == "" {
		neo4jUri = "bolt://localhost:7687"
	}
	neo4jUser := strings.TrimSpace(os.Getenv("NEO4J_USER"))
	if neo4jUser == "" {
		neo4jUser = "neo4j"
	}
	neo4jPass := strings.TrimSpace(os.Getenv("NEO4J_PASSWORD"))
	if neo4jPass == "" {
		neo4jPass = "password"
	}
	aiServiceUrl := strings.TrimSpace(os.Getenv("AI_SERVICE_URL"))
	if aiServiceUrl == "" {
		aiServiceUrl = "http://localhost:5001"
	}

	// Init Database
    db.InitDB()

	// Init Services
	neo4jSvc, err := services.NewNeo4jService(neo4jUri, neo4jUser, neo4jPass)
	if err != nil {
		log.Printf("Failed to create Neo4j service: %v", err)
		// Don't fatal here, let it retry or fail on request for demo robustness
	} else {
		defer neo4jSvc.Close(nil)
	}

	aiClient := services.NewAIClient(aiServiceUrl)
	handler := api.NewBankHandler(neo4jSvc, aiClient)

	// Setup Router
	r := gin.Default()

	// CORS Setup
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // For demo purposes
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Routes
	apiGroup := r.Group("/api/bank")
	{
		apiGroup.POST("/transaction", handler.IngestTransaction)
		apiGroup.GET("/graph", handler.GetGraph)
		apiGroup.GET("/account/:id", handler.GetAccountDetails)
        apiGroup.POST("/transaction/:id/verify", handler.VerifyTransaction)
	}

	testGroup := r.Group("/api/test")
	{
		testGroup.POST("/generate", handler.GenerateISO20022Data)
		testGroup.POST("/reset", handler.ResetData)
	}

    // Platform Routes (Auth, Stats)
    r.POST("/api/login", handler.Login)
    r.GET("/api/stats", handler.GetStats)
    r.POST("/api/stats", handler.UpdateStats)

    // Serve Frontend Static Files (Production)
    // Reverse proxy for AI service on same port
    aiProxy := httputil.NewSingleHostReverseProxy(&url.URL{Scheme: "http", Host: "localhost:5001"})
    r.Any("/api/ai/*any", func(c *gin.Context) {
        // Trim the /api/ai prefix before proxying
        c.Request.URL.Path = strings.TrimPrefix(c.Request.URL.Path, "/api/ai")
        aiProxy.ServeHTTP(c.Writer, c.Request)
    })
    // In Docker, we will copy dist to root or ./dist
    r.Use(static.Serve("/", static.LocalFile("./dist", true)))
    
    // SPA Fallback: If not API and not found, serve index.html
    r.NoRoute(func(c *gin.Context) {
        c.File("./dist/index.html")
    })

	log.Println("Starting Backend Server on :" + func() string { p := os.Getenv("PORT"); if p == "" { return "8080" }; return p }())
	port := os.Getenv("PORT")
	if port == "" { port = "8080" }
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to run server: ", err)
	}
}
