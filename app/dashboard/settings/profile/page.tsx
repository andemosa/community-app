"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "convex/react";
import { Globe, Link, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input"; // Adjust path as needed
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Adjust path as needed
import { GitHub, LinkedIn } from "~/components/icons";
import { Button } from "~/components/ui/button"; // Adjust path as needed
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"; // Adjust path as needed
import { api } from "~/convex/_generated/api";
import { useTitles } from "~/hooks/useTitles";

const LINK_TYPES = [
  {
    tag: "linkedin",
    title: "LinkedIn",
    placeholder: "https://linkedin.com/in/yourname",
  },
  {
    tag: "github",
    title: "GitHub",
    placeholder: "https://github.com/yourname",
  },
  {
    tag: "portfolio",
    title: "Personal Website",
    placeholder: "https://yourwebsite.com",
  },
] as const;

type LinkTag = (typeof LINK_TYPES)[number]["tag"];

const getLinkIcon = (tag: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    linkedin: LinkedIn,
    github: GitHub,
    portfolio: Globe,
  };
  return iconMap[tag.toLowerCase()] ?? Link;
};

const linkSchema = z.object({
  tag: z.enum(["linkedin", "github", "portfolio"]),
  title: z.string().min(1),
  value: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .min(1, { message: "URL is required." }),
});

const formSchema = z.object({
  firstname: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  lastname: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phonenumbers: z.string().optional(), // Can be extended for stricter validation
  title: z.string({}),
  links: z
    .array(linkSchema)
    .max(3, { message: "You can add at most 3 links." }),
});

export default function Profile() {
  const profile = useQuery(api.profiles.getProfile);

  return (
    <div className="px-2 md:px-4">
      <h1 className="text-4xl font-semibold mb-8">Edit Profile</h1>

      {profile ? (
        <ProfileForm
          initialData={{
            firstname: profile.firstName,
            lastname: profile.lastName,
            email: profile.email,
            phonenumbers: profile.phoneNumbers.join(","),
            title: profile?.title,
            links: profile.links ?? [],
          }}
        />
      ) : (
        <div className="text-center">Loading...</div>
      )}
    </div>
  );
}

export function ProfileForm({
  initialData = {},
}: {
  initialData: Partial<z.infer<typeof formSchema>>;
}) {
  const { titles } = useTitles();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...initialData },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "links",
  });

  const usedTags = fields.map((f) => f.tag);
  const availableLinkTypes = LINK_TYPES.filter(
    (t) => !usedTags.includes(t.tag),
  );

  function addLink(tag: LinkTag) {
    const type = LINK_TYPES.find((t) => t.tag === tag)!;
    append({ tag, title: type.title, value: "" });
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    alert(JSON.stringify(values, null, 2)); // For demonstration
  }

  return (
    <div className="">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="john.doe@example.com"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Your email address.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phonenumbers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Numbers</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., +1234567890, +1987654321"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter phone numbers, comma-separated if multiple.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a title" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {titles?.map((title) => (
                      <SelectItem key={title._id} value={title._id}>
                        {title.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Select your preferred title.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-base font-medium leading-none">
                  Profile Links
                </p>
                <p className="text-sm text-muted-foreground">
                  Add up to 3 links to your profile.
                </p>
              </div>

              {/* Add link dropdown — only rendered when slots remain */}
              {availableLinkTypes.length > 0 && (
                <Select onValueChange={(val) => addLink(val as LinkTag)}>
                  <SelectTrigger className="w-40">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      <span>Add Link</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent align="end">
                    {availableLinkTypes.map((type) => {
                      const Icon = getLinkIcon(type.tag);
                      return (
                        <SelectItem key={type.tag} value={type.tag}>
                          <span className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {type.title}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Rendered link rows */}
            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-md">
                No links added yet.
              </p>
            )}

            {fields.map((field, index) => {
              const Icon = getLinkIcon(field.tag);
              const typeConfig = LINK_TYPES.find((t) => t.tag === field.tag)!;

              return (
                <div key={field.id} className="flex items-end gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <FormField
                    control={form.control}
                    name={`links.${index}.value`}
                    render={({ field: inputField }) => (
                      <FormItem className="flex-1">
                        <FormLabel>{typeConfig.title}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={typeConfig.placeholder}
                            {...inputField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => remove(index)}
                    aria-label={`Remove ${typeConfig.title} link`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          <Button type="submit">Save changes</Button>
        </form>
      </Form>
    </div>
  );
}
