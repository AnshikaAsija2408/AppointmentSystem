import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users, Star, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";

const Index = () => {
  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-current" />,
      title: "Meeting Scheduling",
      description: "Book one-on-one meetings with TBB team members at times that work for you"
    },
    {
      icon: <Clock className="h-8 w-8 text-current" />,
      title: "Real-time Support",
      description: "Get instant answers to your questions through our private Q&A system"
    },
    {
      icon: <Users className="h-8 w-8 text-current" />,
      title: "Dedicated Access",
      description: "Secure portal exclusively for TBB clients with personalized dashboard"
    }
  ];

  const benefits = [
    "Direct communication with TBB team members",
    "Secure meeting scheduling and management", 
    "Instant Q&A support system",

  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 mx-auto max-w-7xl">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-primary bg-clip-text text-white rounded-xl p-2 ">
                    TBB Portal
                  </span>
                  <br />
                  <span className="text-foreground">Private Client Access</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Secure portal for TBB clients. Book meetings with our team and get instant support 
                  for all your questions through our private communication system.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login">
                  <Button variant="default" size="lg" className="w-full sm:w-auto bg-gradient-primary hover:opacity-90 transition-opacity">
                    Access Portal
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/dashboard/book">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto border-primary/20 hover:bg-primary/5">
                    Book Meeting
                  </Button>
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-xl overflow-hidden shadow-elegant">
                <img
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=400&fit=crop&crop=center"
                  alt="Professional appointment booking interface"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent"></div>

                {/* Floating notification card */}
                <div className="absolute bottom-6 left-6 bg-card/95 backdrop-blur-sm rounded-lg p-4 shadow-elegant">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-card-foreground">
                      New appointment booked!
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-foreground">
              Why Choose TBB Portal?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built exclusively for TBB clients to provide seamless communication 
              and meeting scheduling with our expert team.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-elegant transition-all duration-300 border-border/50 hover:border-primary/20">
                <CardHeader className="text-center space-y-4">
                  <div className="mx-auto p-3 bg-secondary/50 rounded-full w-fit text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl text-card-foreground">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base text-muted-foreground">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-foreground">
                Exclusive Client Portal
              </h2>
              <p className="text-lg text-muted-foreground">
                Access our invitation-only portal designed specifically for TBB
                clients to streamline communication and meeting coordination.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card className="shadow-elegant border-border/50">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-card-foreground">
                  Ready to Get Started?
                </CardTitle>
                <CardDescription className="text-center text-base">
                  Join hundreds of professionals who trust our platform
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 bg-gradient-primary rounded-full border-2 border-background"></div>
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground ml-2">Exclusive access</span>
                </div>

                <div className="flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-5 w-5 fill-warning text-warning" />
                  ))}
                  <span className="ml-2 text-sm font-medium text-card-foreground">Trusted by TBB clients</span>
                </div>

                <Link href="/login" className="block">
                  <Button variant="default" size="lg" className="w-full bg-gradient-primary hover:opacity-90 transition-opacity">
                    Access Client Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;